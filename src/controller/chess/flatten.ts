import { TreeItem } from 'types/Chess'
import { fileLog } from '../shared/fileLog'

export function flatten(input: TreeItem[]): TreeItem[][] {
  const start = Date.now()
  // Initialize an empty array to store the output
  const output: TreeItem[][] = []

  // Define a helper function that takes an input element and an output element
  // and recursively adds the input element and its children to the output element
  function helper(inputElement: TreeItem, outputElement: TreeItem[]) {
    // Add the input element to the output element
    outputElement.push({
      piece: inputElement.piece,
      move: inputElement.move,
      turn: inputElement.turn,
      evaluation: 0
    })

    // If the input element has no children, add the output element to the output array
    if (inputElement.next?.length === 0) {
      output.push(outputElement)
    } else {
      // Otherwise, loop through the children of the input element
      for (const child of inputElement.next ?? []) {
        // Make a copy of the output element
        const newOutputElement = [...outputElement]

        // Call the helper function with the child and the new output element
        helper(child, newOutputElement)
      }
    }
  }

  // Loop through the input array
  for (const element of input) {
    // Call the helper function with each element and an empty array
    helper(element, [])
  }

  // Return the output array
  const end = Date.now()
  fileLog(
    'flatten',
    `flatten took ${end - start} ms and yielded ${output.length} positions`
  )
  return output
}
