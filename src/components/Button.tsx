import React, { ReactNode } from "react";

interface Props{
    children: ReactNode;
    buttonType: string;
    onClick: () => void;
}

const Button = ({children, buttonType, onClick}: Props) => {
    return (
        <button type = "button" className={buttonType} onClick={onClick}>{children}</button>
    )
}

export default Button;