import { inngest } from "@/core/inngest/client";


type InngestHealthInngestEvent = {
  data: {
    name: string;
  };
};

const helloWorld = inngest.createFunction({ id: "hello-world" }, { event: "inngest_health/trigger/hello.world" }, async ({ event, step }) => {
  await step.sleep("wait-a-moment", "1s");
  return { message: `Hello ${event.data.name}!` };
});


export { helloWorld, type InngestHealthInngestEvent };