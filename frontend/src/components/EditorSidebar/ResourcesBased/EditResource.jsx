import React, { useState, useEffect } from 'react'
import { Button, Input, FormControl, FormLabel, Divider,CheckboxGroup, Checkbox, Stack, Box, Select  } from '@chakra-ui/react';

const EditResource = ({getData, currentResource, setCurrent }) => {
  const [id, setId] = useState('');
  const [costHour, setCostHour] = useState('');
  const [schedule, setSchedule] = useState('');
  const [numberOfInstances, setNumberOfInstances] = useState('');
  const [timeTables, setTimeTables] = useState(getData().getCurrentScenario().resourceParameters.timeTables.map(item => item.id));
  const [roles, setRoles] = useState(getData().getCurrentScenario().resourceParameters.roles.map(item => item.id));
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    const currResource = getData().getCurrentScenario().resourceParameters.resources.find((value) => value.id === currentResource);
    if (currResource) {
      setId(currResource.id);
      setNumberOfInstances(currResource.numberOfInstances);
      setCostHour(currResource.costHour);
      setSchedule(currResource.schedule);
      setSelectedRoles(
        getData().getCurrentScenario().resourceParameters.roles
          .filter(item => item.resources.some(x => x.id === currentResource))
          .map(x => x.id)
      );
    } 
  }, []);

  const handleRolesChange = (event) => {
    let value = event.pop()

    if(selectedRoles.includes(value)){
      setSelectedRoles([...selectedRoles.filter(item => item === value)]);
    } else{
      setSelectedRoles([...selectedRoles, value]);
    }
  }

  const handleInputChange = (resource) => {
    const target = resource.target;
    const value = target.value;
    const name = target.name;

    if (name === 'id') {
      setId(value);
    } else if (name === 'costHour') {
      setCostHour(value);
    } else if (name === 'schedule') {
      setSchedule(value);
    } else if (name === 'numberOfInstances') {
      setNumberOfInstances(value);
    }
  }


  const onSubmit = (event) => {
    event.preventDefault();

    const resource = getData().getCurrentScenario().resourceParameters.resources.find(value => value.id === currentResource);
    resource.id = id;
    resource.costHour = costHour;
    resource.schedule = schedule || undefined; // Is nullable by putting in empty string
    resource.numberOfInstances = numberOfInstances;
  
    getData().getCurrentScenario().resourceParameters.roles.forEach(obj => {
      obj.resources = obj.resources.filter(resource => resource.id !== currentResource);
    });
  
    selectedRoles.filter(x => x !== undefined).forEach(item => {
      getData().getCurrentScenario().resourceParameters.roles.find(x => x.id === item).resources.push({id});
    });
  
    getData().saveCurrentScenario();
  };
  

      const deleteResource = () =>{   

        getData().getCurrentScenario().resourceParameters.roles.forEach(obj => {
          obj.resources = obj.resources.filter(resource => resource.id !== id);
        });

        getData().getCurrentScenario().resourceParameters.resources = getData().getCurrentScenario().resourceParameters.resources.filter(resource => resource.id !== id);
       

        console.log(getData().getCurrentScenario().resourceParameters)
        getData().saveCurrentScenario();
        
      }



    return (
        <>
        
        <Button onClick={() => setCurrent("Add Resource")}
                colorScheme='#ECF4F4'
                variant='outline'
                w="100%"
                border='1px'
                borderColor='#B4C7C9'
                color ='#6E6E6F'
                _hover={{ bg: '#B4C7C9' }}> Add resource </Button> 

        <Button onClick={() => setCurrent("Add Role")}
               colorScheme='#ECF4F4'
                variant='outline'
                w="100%"
                border='1px'
                borderColor='#B4C7C9'
                color ='#6E6E6F'
                _hover={{ bg: '#B4C7C9' }}> Add role </Button> 

        <Divider/>
        <Box w="100%">
        {id !== "" ?
        <>
         <form onSubmit={onSubmit}>
         <Stack gap="2" mt="4">
         <FormControl >
              <FormLabel>Resource Name:</FormLabel>
              <Input value={id}  bg="white"  name="id" onChange={(event) => handleInputChange(event)}/>
          </FormControl>

          <FormControl>
              <FormLabel>Cost per Hour:</FormLabel>
              <Input value={costHour} bg="white"  name="costHour" onChange={(event) => handleInputChange(event)} />
          </FormControl>


          <FormControl >
              <FormLabel>Number of Instances:</FormLabel>
              <Input value={numberOfInstances} bg="white" name = "numberOfInstances" onChange={(event) => handleInputChange(event)}  />
          </FormControl>

          <FormControl >
              <FormLabel>Timetable:</FormLabel>
              <Select value={schedule} bg="white" {...(!schedule && {color : 'darkgray'})} name="schedule" onChange={(event) => handleInputChange(event)} >
                <option value={''} key='default'>default for {roles[0]}</option>
                {timeTables.map((id, index) => {
                    return <option style={{ color: 'black' }} value={id} key={index}>{id}</option>
                })}
            </Select>
         </FormControl>

          <FormControl >
            <FormLabel>Select roles:</FormLabel>
            <CheckboxGroup colorScheme='green' value={selectedRoles} name="selectedRoles" onChange={(event) => handleRolesChange(event)}>
              <Stack spacing={[1, 5]} direction="column">
              {roles.map((id, index) => {
                      return <Checkbox value={id} key={index}>{id}</Checkbox>
                  })}
              </Stack>
            </CheckboxGroup>
          </FormControl>


          <Button 
              type="submit"
              colorScheme='#ECF4F4'
              w="100%"
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color ='#6E6E6F'
              _hover={{ bg: '#B4C7C9' }}> Save changes </Button> 


          <Button colorScheme='red' variant='outline' w="100%" onClick={deleteResource}>Delete resource</Button>
        
              </Stack>
        </form>
        
        </>
        : ""}
        </Box>
        </>
       
    )
}

export default EditResource;