import Timer from "../index";

export const taggedLiteralRunner = () => {
  const timer = new Timer({ filename: "exemplar/taggedLiterals.ts" });

  timer.tlog`Hello, I am a string`;

  const timer2 = new Timer({ filename: "exemplar/taggedLiterals.ts" });

  timer.tlog`I am a 
multiline
string`;

  timer.tsql`SELECT * FROM persons`;

  timer.tlog`I am a very long string and should be wrapped over multiple lines in most regular sized command line terminals if using a small monitor/laptop screen to test timer-logs package from npm`;
};

taggedLiteralRunner();
