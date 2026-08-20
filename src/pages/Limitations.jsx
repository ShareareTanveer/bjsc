// pages/Limitations.js
import React from "react";
import MCQLibrary from "../components/MCQLibrary";
import { Scale } from "lucide-react";

export default function Limitations() {
  return (
    <MCQLibrary
      dataPath="/data/limitations/questions.json"
      title="Code of Civil Procedure, 1908"
      badgeText="CPC Reference"
      icon={Scale}
      loadingText="Loading CPC questions..."
      practiceTitle="CPC Practice"
      footerNote="About this CPC Bank"
    />
  );
}