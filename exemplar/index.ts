import {Timer} from "timer-logs";
import {taggedLiteralRunner} from "./taggedLiterals.js";

// instantiate the logger with some config values. The bare minimum is the filename
const timer = new Timer({
  filename: "/exemplar/index.ts",
  label: "Exemplar of how the logger can be used",
  omitStackTrace: true,
  environment: "development",
});

// log a custom error without actually throwing Error
timer.customError("Hellp!");

// log any type of Error
try {
  JSON.parse("i am not json");
} catch (e) {
  timer.genericError(e);
}
taggedLiteralRunner();
// overriding the default error message in a promise .catch()
new Promise((resolve) => setTimeout(resolve, 50))
  .then(() => {
    throw new Error("Unexpected error occurred");
  })
  .catch(
    timer.genericErrorCustomMessage(
      "A better explanation for what caused this error"
    )
  );

const postgresExample = async () => {
  const { rows } = await new Promise((resolve) => setTimeout(resolve, 50))
    .then(() => {
      throw new Error("Unexpected error occurred");
      return { rows: ["row1", "row2"] };
    })
    .catch(timer.postgresErrorReturn({ rows: [] }));
  console.assert(
    rows instanceof Array,
    "Rows should be an array even if an error is thrown"
  );
};
const name = "bob";
// log a SQL query with a parameter using the template tag
timer.tsql`SELECT * FROM persons p join birthdays b ON p.date=b.date WHERE name='tom' AND b.age > 35 OR name=${name}`;

const order = { code: "0001", qty: 81, items: [1, 2, 3] };
timer.tlog`New order received: ${order}`;

postgresExample().then(() => {
  timer.info("Some info about the state of the program:", false, 1, 2, 3, [
    "one",
    "two",
    "three",
  ]);
  timer.alert("Something has gone seriously wrong!");
  timer.warn(
    "This shouldn't happen under normal circumstances, but isn't a catastrophe"
  );
  // always call flush at the end of the file (before the return statement) to print out the log
  timer.flush();
});
