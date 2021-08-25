import Timer from "../index";

export const taggedLiteralRunner = () => {
  const timer = new Timer({ filename: "exemplar/taggedLiterals.ts" });

  timer.tlog`Hello, I am a string`;

  const timer2 = new Timer({ filename: "exemplar/taggedLiterals.ts" });

  timer.tlog`I am a 
multiline
string`;
};

taggedLiteralRunner();
