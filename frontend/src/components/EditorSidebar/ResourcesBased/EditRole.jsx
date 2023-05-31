import { React, useState, useEffect } from 'react';
import { Button, Input, FormControl, FormLabel, Divider, Select, Stack, Box } from '@chakra-ui/react';

const EditRole = ({getData, currentRole, setCurrent}) => {
  const [id, setId] = useState("");
  const [schedule, setSchedule] = useState("");

  const timeTables = getData().getCurrentScenario().resourceParameters.timeTables.map(item => item.id);

  useEffect(() => {
    if (getData().getCurrentScenario().resourceParameters.roles.find(value => value.id === currentRole)) {
      setId(getData().getCurrentScenario().resourceParameters.roles.find(value => value.id === currentRole).id);
      setSchedule(getData().getCurrentScenario().resourceParameters.roles.find(value => value.id === currentRole).schedule);
    }
  }, []);


  const handleInputChange = ({ target: { value, name } }) => {
    if (name === 'id') {
      setId(value);
    }  
    
    if (name === 'schedule') {
      setSchedule(value);
    } 
  }

  const onSubmit = (event) => {
    event.preventDefault();

    getData().getCurrentScenario().resourceParameters.roles.find(value => value.id === currentRole).schedule = schedule;
    getData().getCurrentScenario().resourceParameters.roles.find(value => value.id === currentRole).id = id;

    getData().saveCurrentScenario();
  };

  const deleteRole = () => {
    getData().getCurrentScenario().resourceParameters.roles = getData().getCurrentScenario().resourceParameters.roles.filter(role => role.id !== id);
    getData().saveCurrentScenario();
  };

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
        <form onSubmit={onSubmit}>
        <Stack gap="2" mt="4">
         <FormControl >
              <FormLabel>Role Name:</FormLabel>
              <Input value={id} bg="white" name = "id" onChange={(event) => handleInputChange(event)} />
          </FormControl>


          <FormControl >
              <FormLabel>Timetable:</FormLabel>
              <Select value={schedule} bg="white" name="schedule" onChange={(event) => handleInputChange(event)} >
                {timeTables.map((id, index) => {
                    return <option value={id} key={index}>{id}</option>
                })}
            </Select>
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

        <Button colorScheme='red' variant='outline' w="100%" onClick={deleteRole}>Delete resource</Button>
        </Stack>
        </form>
        </Box>
        </>
    )
}

export default EditRole;