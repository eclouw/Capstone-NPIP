import React, { ReactNode } from "react";

//Parameters
interface Props{
    children: ReactNode;
    buttonType: string;
    onClick: () => void;
}
//A button that can take a function when it is clicked
const Button = ({children, buttonType, onClick}: Props) => {
    return (
        <button type = "button" className={buttonType} onClick={onClick}>{children}</button>
    )
}

export default Button;