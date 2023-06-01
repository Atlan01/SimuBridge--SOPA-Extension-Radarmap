import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Text,
    Tr,
    Th,
    Td
} from '@chakra-ui/react'


function OverviewResourceTable(props) {

    return (
        // Represenation of Resource Parameters for the chosen in the tabbar scenario
        <Table variant='simple' >
            <Thead>
                <Tr>
                    <Th>Role</Th>
                    <Th>Resource</Th>
                    <Th>Cost</Th>
                    <Th>Currency</Th>
                    <Th>Quantity</Th>
                    <Th>Timetable</Th>
                </Tr>
            </Thead>
            <Tbody>
                {/*Filling in the table*/}
                {props.getData().getScenarioByIndex(props.scenario_id).resourceParameters.roles.map((element) => {
                    return <Tr>
                        <Td>{element.id}</Td>
                        <Td> {element.resources.map((resource) => {
                            return <Text onClick={() => props.setResource(resource.id)}> {resource.id} </Text>
                        })} </Td>
                        <Td>{element.resources.map((res) => {
                            let resource = props.getData().getScenarioByIndex(props.scenario_id).resourceParameters.resources.find(item => item.id === res.id)
                            return <Text>{resource.costHour}</Text>
                        })}</Td>
                        <Td>{props.getData().getScenarioByIndex(props.scenario_id).currency}</Td>
                        <Td>{element.resources.map((res1) => {
                            let resource1 = props.getData().getScenarioByIndex(props.scenario_id).resourceParameters.resources.find(item => item.id === res1.id)
                            return <Text>{resource1.numberOfInstances}</Text>
                        })}</Td>
                        <Td>{element.schedule}</Td>
                    </Tr>
                })}
            </Tbody>
        </Table>

    )
}

export default OverviewResourceTable


