import React, { useState } from "react";
import "./LLMChatBotSmallButton.css";
import { IbmWatsonxAssistant } from "@carbon/icons-react";
import LLMChatBotSmallModal from "./LLMChatBotSmallModal";

const LLMChatBotSmallButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const handleClick = () => {
    if (!hasOpened) {
      setHasOpened(true);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-widget-container">
      <button className="LLM_Chat_button" onClick={handleClick}>
        <IbmWatsonxAssistant size={24} />
      </button>
      {isOpen && <LLMChatBotSmallModal open={isOpen} setOpen={setIsOpen} isFirstOpen={!hasOpened} />}
    </div>
  );
};

export default LLMChatBotSmallButton;
