import React from 'react'

interface Props{
    labelText: string;
    name:string;
}

const InputField = ({labelText, name} : Props) => {
  return (
    <>
    <label>{labelText} <input name={name}/></label>
    </>
  )
}

export default InputField