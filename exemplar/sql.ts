import Timer from "../index";

export const sqlRunner = () => {
  const timer = new Timer({ filename: "exemplar/sql.ts" });
  timer.tsql`SELECT \`WorkLog\`.\`time\`, \`WorkLog\`.\`taskId\`, \`WorkLog\`.\`comment\`, \`WorkLog\`.\`durationHours\`, \`Task\`.\`id\` AS \`Task.id\`, \`Task\`.\`title\` AS \`Task.title\`, \`Task\`.\`assignee\` AS \`Task.assignee\`, \`Task\`.\`project\` AS \`Task.project\`, \`Task\`.\`originalEstimateHours\` AS \`Task.originalEstimateHours\`, \`Task\`.\`totalTimeSpentHours\` AS \`Task.totalTimeSpentHours\` FROM \`WorkLogs\` AS \`WorkLog\` LEFT OUTER JOIN \` Tasks\` AS \` Task\`
             ON \` WorkLog\`.\` taskId\` = \` Task\`.\` id\`;`;
};

sqlRunner();
