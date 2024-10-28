"use client";

import React, { useContext, useState } from "react";
import { PersonalizeContext } from "../../lib/contentstack";

type PersonalizeType = "Marketer" | "Developer" | "Reset";

interface PersonalizeButtonProps {
  type: PersonalizeType;
}

const PersonalizeButton: React.FC<PersonalizeButtonProps> = ({ type }) => {
  const [clicked, setClicked] = useState<boolean>(false);
  const Personalize = useContext(PersonalizeContext);

  const handleClick = async () => {
    let p13nAttributes: { marketer: boolean; developer: boolean };
    let eventName: string;

    switch (type.toLowerCase()) {
      case "marketer":
        p13nAttributes = { marketer: true, developer: false };
        eventName = "CtaMarketer";
        break;
      case "developer":
        p13nAttributes = { marketer: false, developer: true };
        eventName = "CtaDeveloper";
        break;
      case "reset":
        p13nAttributes = { marketer: false, developer: false };
        eventName = "CtaReset";
        break;
      default:
        console.error("Invalid personalization type");
        return;
    }

    setClicked(true);

    // set Personalize attribute for p13nAttributes (marketer, CtaDeveloper, CtaReset).
    // see: Contentstack Dashboard > Personalize project > Events
    await Personalize.set(p13nAttributes);

    // send Personalize event for the experience for eventName (CtaMarketer, CtaDeveloper, CtaReset).
    // see: Contentstack Dashboard > Personalize project > Events
    await Personalize.triggerEvent(eventName);

    window.location.href = "http://localhost:3000";
  };

  return (
    <div className="flex space-x-4 items-center">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {type === "Reset" ? <>Reset attributes</> : <>Set Attribute: {type}</>}
      </button>
      {clicked ? <p>Setting {type} Personalization</p> : null}
    </div>
  );
};

export default PersonalizeButton;
