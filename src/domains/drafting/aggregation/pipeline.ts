import { inngest } from "@/core/inngest/client";



export default inngest.createFunction(
  // Config
  { id: "run-drafting-aggregation" },
  // Trigger
  { event: "drafting/trigger/aggregation" },
  // Handler
  async ({ event, step }) => {
    // Step 1: Extract facts from sources
    const extractedFacts = await step.run("extract-facts", async () => {
        


        const letsCheck = event.data.metadata;

        console.log(letsCheck.articleId);

      return {
        facts: "Extracted facts from sources",
        count: 5,
      };
    });

    // Step 2: Generate article outline
    const outline = await step.run("generate-outline", async () => {
      return {
        title: "Generated Article Title",
        sections: ["Introduction", "Main Content", "Conclusion"],
        factCount: extractedFacts.count,
      };
    });

    return { extractedFacts, outline };
  }
);
