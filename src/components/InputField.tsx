import React from 'react'

//Parameters
interface Props{
    labelText: string;
    name:string;
}

//An inputfield that can have a name for id purposes and text
const InputField = ({labelText, name} : Props) => {
  return (
    <>
    <label>{labelText} <input name={name}/></label>
    </>
  )
}

export default InputField