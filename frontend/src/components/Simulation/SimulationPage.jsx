import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';

import { getFile, getScenarioFileName, setFile } from "../../util/Storage";
import { convertScenario } from "simulation-bridge-converter-scylla/ConvertScenario";
import RunProgressIndicationBar from "../RunProgressIndicationBar";
import ToolRunOutputCard from "../ToolRunOutputCard";

const SimulationPage = ({projectName, getData, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errored, setErrored] = useState(false);
  const [response, setResponse] = useState(JSON.parse(sessionStorage.getItem(projectName+'/lastSimulatorResponse')) || {});

  const [scenarioName, setScenarioName] = useState();
  const [simulator, setSimulator] = useState();

  // Creating a reference to the source that can be cancelled if needed
  const source = useRef(null);

  // function to start the simulation
  const start = async () => {
    let variants = getData().getCurrentScenario().environmentImpactParameters.variants;
    if(variants.reduce((sum, variant) => sum + parseInt(variant.frequency), 0) != 100)
    {
      toasting("error", "Frequencies sum is not 100%", "For correct simulation, the sum of frequencies must be 100%");
      return;
    }

    // Resetting response and finished states
    setResponse({ message: "", files: [] });
    setFinished(false);
    setErrored(false);
    // Updating the started state
    setStarted(true);

    // Creating a cancel token and assigning it to the current source
    source.current = axios.CancelToken.source();

    try {
      const requestId = 'request' + Math.random();
      const formData = new FormData();
      const scenarioData = getData().getScenario(scenarioName);
      
      console.log('ScenarioData', scenarioData);

      const {globalConfig, simConfigs} = await convertScenario(scenarioData);

      console.log("globalConfig", globalConfig);
      console.log("simConfigs", simConfigs[0]);

      const simConfig = simConfigs[0]; //TODO magic index access
      const processModel = scenarioData.models[0]; //TODO magic index access

      let bpmn = processModel.BPMN;
      bpmn = bpmn.replace(/'/g, "");
      //console.log('BPMN', bpmn);

      const bpmnFile = new File([bpmn], processModel.name + '.bpmn')
      formData.append("bpmn", bpmnFile, bpmnFile.name);
      const globalConfigFile = new File([globalConfig], scenarioData.scenarioName + '_Global.xml')
      formData.append("globalConfig", globalConfigFile, globalConfigFile.name);
      const simConfigFile = new File([simConfig], scenarioData.scenarioName + '_' + bpmnFile.name + '_Sim.xml')
      formData.append("simConfig", simConfigFile, simConfigFile.name); 

      // Sending a POST request to apiTool.py in the Scylla-Container subproject, with the cancel token attached
      const r = await axios.post("http://127.0.0.1:8080/scyllaapi", formData, {
        headers: {
          'requestId' : requestId,
          'Content-Type': 'multipart/form-data'
        },
        cancelToken: source.current.token
      });
      r.data.files.forEach(file => {
        // Modify the file name by prefixing the scenario name
        const newFileName = `${scenarioData.scenarioName}_${file.name}`;
        setFile(projectName, requestId + '/' + newFileName, file.data);
      });

      // Setting the response state and updating the finished and started states
      const responseObject = {
        message : r.data.message,
        files : r.data.files.map(file => `${scenarioData.scenarioName}_${file.name}`), // Update file names with the scenario name prefix
        finished : new Date(),
        requestId
      }
      setResponse(responseObject);
      sessionStorage.setItem(projectName+'/lastSimulatorResponse', JSON.stringify(responseObject));
      setFinished(true);
      setStarted(false);
      // Toasting a success message
      toasting("success", "Success", "Simulation was successful");
    } catch (err) {
      // If there's a cancellation error, toast a success message
      if (axios.isCancel(err)) {
        toasting("success", "Success", "Simulation was canceled");
      } else {
        // Otherwise, toast an error message
        setFinished(true);
        setStarted(false);
        setErrored(true);
        console.log(err)
        //TODO also display error occurence
        toasting("error", "error", "Simulation was not successful");
      }
    }
  };

  // Function to abort the simulation
  const abort = () => {
    console.log("abort");
    // Cancelling the source and updating the finished and started states
    source.current.cancel("Simulation was canceled");
    setStarted(false);
    setResponse({ message: "canceled" });
  };

  //  function to download the file
  const download = async (data, fileName, encoding='charset=UTF-8') => {
    // Fetching the file, creating a blob and a URL
    const encodedData = encodeURIComponent(data);
    const a = document.createElement("a");
    // Creating a download link and triggering a click event
    const fileType = fileName.split('.').pop();

    a.href = 'data:application/' + fileType + ';' + encoding + ',' + encodedData;
    a.download = fileName;
    // a.download = `${sessionStorage.getItem("currentProject")}_${name}.${type}`;
    a.click();
  };



    return (
        <Box h="93vh" overflowY="auto" p="5" >
        <Stack gap="2">
        <Heading size='lg' >Run Simulation</Heading>

        
        <RunProgressIndicationBar {...{started, finished, errored}}/>
            <Card bg="white">
                <CardHeader>
                    <Heading size='md'> Start Simulation Run </Heading>
                </CardHeader>
                <CardBody>
                  
                    <Flex
                        gap="5"
                        flexDirection="row"
                        alignItems="end"
                        mt="-4"
                        >               
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select scenario:</Text>
                                <Select value={scenarioName} placeholder = 'choose scenario' width = '100%' {...(!scenarioName && {color: "gray"})} backgroundColor= 'white' icon={<FiChevronDown />} onChange={evt => setScenarioName(evt.target.value)}>
                                {
                                  getData().getAllScenarios().map((scenario, index) => {
                                    return  <option value= {scenario.scenarioName} color="black">{scenario.scenarioName}</option>
                                  })
                                }
                                </Select>
                            </Box>
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select simulator:</Text>
                                <Select value={simulator} placeholder = 'choose simulator' width = '100%'  {...(!simulator && {color: "gray"})}  backgroundColor= 'white' icon={<FiChevronDown />} onChange={evt => setSimulator(evt.target.value)}>
                                    <option value='Scylla' color="black">Scylla</option>
                                </Select>
                            </Box>
                            
                            {!started&& 
                            <Button variant="outline" bg="#FFFF" onClick={start} disabled={!scenarioName || !simulator}>
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Start Simulation</Text>
                            </Button>}

                            {started&& 
                            <Button variant="outline" bg="#FFFF" onClick={abort}>
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Abort Simulation</Text>
                            </Button>
                            }

                        </Flex>
                </CardBody>
            </Card>

            
            <ToolRunOutputCard {...{projectName, response, toolName : 'Simulator', processName : 'simulation', filePrefix : response.requestId}}/>
            
        
            
        </Stack>
        </Box>
    )
}
export default SimulationPage;
