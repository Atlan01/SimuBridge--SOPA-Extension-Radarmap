import React from 'react'
import { Flex, Text, Menu, MenuButton, Input, Button, MenuList, MenuItem } from '@chakra-ui/react'

function BPMNSwitcher({ data, currentScenario, currentBpmn, setBpmn }) {
  const name = data[currentScenario]?.models[currentBpmn].name
  const fontStyles = { fontSize: { base: "2xs", md: "sm" }, color: "RGBA(0, 0, 0, 0.64)"}
  const inputStyles = { variant: "filled", isDisabled: true, bg: "blackAlpha.200", _hover: "blackAlpha.200", ...fontStyles, w: { base: "100%", md: "65%" } }

  return (
    <Menu>
      <Text ml={2} textAlign="left" display="flex" {...fontStyles} fontWeight="bold">
        Current BPMN Model:
      </Text>
      <Flex gap={{ base: "3", md: "3" }} flexDirection={{ base: "column", md: "row" }} w="100%">
        <Input placeholder={name || '<none>'} aria-label="bpmn name" {...inputStyles} />
        <MenuButton
          as={Button}
          variant="outline"
          textAlign="left"
          p={3}
          borderRadius={8}
          w={{ base: "100%", md: "30%" }}
          aria-label="bpmn switcher"
        >
          <Text {...fontStyles}>Change</Text>
        </MenuButton>
        <MenuList>
          {(data[currentScenario]?.models || []).map((bpmn, index) => (
            <MenuItem key={index} onClick={() => setBpmn(index)}>
              {bpmn.name}
            </MenuItem>
          ))}
        </MenuList>
      </Flex>
    </Menu>
  )
}

export default BPMNSwitcher
