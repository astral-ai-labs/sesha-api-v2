/* ==========================================================================*/
// index.ts — Create outline step execution
/* ==========================================================================*/
// Purpose: Create structural outline for aggregated article from source(s)
// Sections: Imports, Helpers, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse, formatHeadlinesBlobs } from "@/domains/drafting/common/utils";
import type { CreateOutlineRequest, CreateOutlineResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Helpers
/* ==========================================================================*/

/**
 * Build sources array with factsBitSplitting1 and factsBitSplitting2 combined.
 */
function buildSourcesWithFactsSplitting(sources: CreateOutlineRequest["sources"], extractedFactsResults: CreateOutlineRequest["context"]["extractedFactsResults"], extractedFactsConditionalResults: CreateOutlineRequest["context"]["extractedFactsConditionalResults"]) {
  return sources.map((source) => {
    const factsResult = extractedFactsResults.find((r) => r.sourceNumber === source.number);
    const conditionalResult = extractedFactsConditionalResults.find((r) => r.sourceNumber === source.number);

    return {
      ...source,
      factsBitSplitting1: factsResult?.extractedFacts || "",
      factsBitSplitting2: conditionalResult?.factsBitSplitting2 || "",
    };
  });
}

/**
 * Check if any source has useVerbatim flag set.
 */
function hasVerbatimSource(sources: CreateOutlineRequest["sources"]): boolean {
  return sources.some((source) => source.flags?.copySourceVerbatim);
}

/**
 * Get the key point instructions based on the number of sources.
 */

function getKeyPointInstructions(sourceCount: number): string {
  if (sourceCount >= 1 && sourceCount <= 3) {
    return "Pull 12 key points for the outline.";
  } else if (sourceCount === 4) {
    return "Pull 14 key points for the outline.";
  } else if (sourceCount === 5) {
    return "Pull 16 key points for the outline.";
  } else if (sourceCount >= 6) {
    return "Pull at least 17 key points for the outline.";
  } else {
    // Fallback for edge case
    return "Pull 12 key points for the outline.";
  }
}

/**
 * Get example outlines based on verbatim flag
 *
 * @param isVerbatim - Whether to show verbatim examples or default examples
 * @returns String containing the appropriate examples
 */
function getExampleOutlines(isVerbatim: boolean): string {
  const defaultExamples = `
EXAMPLE 1:
<outline>
KEY POINTS IN ORDER:
1. Cover Navalnaya's call for a polling day protest in a memo circulated on Thursday (Source 1 BBCNews, Source 2 WashPo, Source 4 Reuters)
2. Include Navalnaya's voting instructions and social media support on the X platform. (Source 1 BBCNews, Source 2 WashPo, Source 4 Reuters)
3. Cover Alexei Navalny's proposed protest actions before his death (Source 1 BBCNews, Source 4 Reuters)
4. Cover Kremlin's cause of death claim and supporters' blame on Putin (Source 1 BBCNews, Source 3 The Telegraph)
5. Include Ukraine's first lady declining to sit next to Navalnaya at State of the Union (Source 1 BBCNews, Source 4 Reuters)
6. Cover Navalny's anti-corruption icon status and clouded legacy in Ukraine (Source 2 WashPo)
7. Include White House's reason for Zelenska's decision (Source 2 WashPo, Source 3 The Telegraph)
8. Include Navalnaya's reason for not attending Biden's address (Source 2 WashPo, Source 3 The Telegraph)
9. Cover Macron urging allies to support Ukraine and discuss sending troops (Source 3 The Telegraph)
10. Include controversy and clarification of Macron's troop comments (Source 2 WashPo, Source 1 BBCNews)
11. Cover criticism from Putin's foreign intelligence chief on Macron's remarks (Source 2 WashPo, Source 4 Reuters)
12. Include context on Russian invasion leading to crisis and nuclear war warning (Source 4 Reuters)
</outline>

EXAMPLE 2: 
<outline>
KEY POINTS IN ORDER:
1. Cover MSNBC anchors mocking GOP primary voters in Virginia over immigration concerns (Source 1, Source 2 FoxNews, Source 4 Mediate)
2. Include Rachel Maddow's criticism of her network for airing Trump's Super Tuesday victory speech (Source 2 FoxNews, Source 4 Mediate)
3. Cover Gallup survey results on Americans citing immigration as the most important issue (Source 1, Source 2 FoxNews)
4. Include MSNBC cutting Trump's speech to fact-check claims on economy and immigration (Source 3 The Raw Story, Source 6 The Telegraph)
5. Cover Joy Reid's criticism of White working-class Republican voters on race and immigration (Source 1)
6. Include Rachel Maddow and Stephanie Ruhle fact-checking Trump's Super Tuesday speech (Source 1, Source 4 Mediate)
7. Cover MSNBC host praising Biden administration on wages and criticizing Trump's pandemic economy (Source 1, Source 3 The Raw Story, Source 5 Breitbart News)
8. Include critics accusing MSNBC of being disconnected from voters' immigration concerns (Source 1, Source 2 FoxNews)
9. Cover backlash against MSNBC from conservatives and anti-Trump figures for mocking segment (Source 2 FoxNews, Source 3 The Raw Story, Source 4 Mediate)
10. Include Trump's pledge in victory speech to tackle illegal border crossings (Source 1)
11. Cover Trump's pledge to close the border and deport people (Source 1, Source 2 FoxNews)
12. Include crowd chants of "USA, USA, USA" during Trump's speech (Source 6 The Telegraph)
13. Cover Republicans busing migrants to locations like New York and Martha's Vineyard (Source 2 FoxNews, Source 5 Breitbart News)
14. Include Van Jones's claim that Democrats can win on immigration with a mainstream position (Source 3 The Raw Story, Source 5 Breitbart News)
15. Cover Trump's primary victories in Virginia with immigration as a top priority for voters (Source 2 FoxNews, Source 5 Breitbart News)
</outline>

EXAMPLE 3:
<outline>
KEY POINTS IN ORDER:
1. Cover Nikki Haley's announcement to exit the Republican presidential race, clearing the path for Donald Trump (Source 1 CNN, Source 2 The Hill, Source 3 Newsweek)
2. Cover Biden campaign labeling Trump as "wounded, dangerous, and unpopular" despite his Super Tuesday dominance (Source 1 CNN)
3. Cover Biden campaign's plan to target moderate and Haley voters disillusioned with Trump (Source 1 CNN, Source 2 The Hill)
4. Include Republican voter hesitation to support the GOP candidate in November despite Trump's Super Tuesday success (Source 3 Newsweek, Source 4 The Raw Story)
5. Cover Haley's unexpected victory in Vermont and strong performances in other states (Source 2 The Hill, Source 3 Newsweek)
6. Include Biden campaign's declaration of a "clear path to victory" despite Trump's significant wins on Super Tuesday (Source 1 CNN, Source 3 Newsweek)
7. Cover Biden campaign memo criticizing Trump as "wounded, dangerous, and unpopular" despite his Super Tuesday victories (Source 1 CNN, Source 2 The Hill)
8. Include Biden campaign downplaying concerning poll numbers and focusing on undecided voters (Source 1 CNN)
9. Cover Mitch Landrieu's criticism of Trump's "low energy" and falsehood-filled victory speech (Source 4 The Raw Story, Source 5 WashPo)
10. Cover Democrats beginning to panic as Trump's campaign fails to implode (Source 1 CNN, Source 3 Newsweek)
11. Include Biden trailing Trump in polls, highlighting concerns about his message with swing voters (Source 2 The Hill)
12. Cover Supreme Court's unanimous decision in Trump's favor in a 14th Amendment case (Source 2 The Hill, Source 4 The Raw Story)
13. Include Ukraine's First Lady declining State of the Union invitation due to Navalny's support for Russia's territorial claims (Source 2 The Hill, Source 5 WashPo)
14. Cover Biden preparing for State of the Union address amid a politically divided Congress, highlighting achievements (Source 5 WashPo, Source 6 FoxNews)
15. Include that it will be the latest ever State of the Union address (Source 1 CNN, Source 4 The Raw Story)
</outline>

Example 4:
<outline>
KEY POINTS IN ORDER:
1. Cover Gary Goldsmith revealing on Celebrity Big Brother that Kate Middleton is recovering well from her surgery and receiving "the best care in the world" (Source 1 The Sun, Source 2, Source 3 Sun2)
2. Include Goldsmith dismissing conspiracy theories and assuring viewers Kate will return to her public duties (Source 1 The Sun, Source 2)
3. Cover Goldsmith's statement on Prince Harry and Meghan Markle's royal titles, suggesting they should be removed (Source 1 The Sun, Source 2)
4. Include Goldsmith's defense of Kate against being called common, highlighting her parents' multimillionaire status (Source 1 The Sun, Source 2, Source 3 Sun2)
5. Cover viewer backlash to Goldsmith's comments on Harry and Meghan, including threats to "switch off" the show (Source 2 GBNews, Source 3 Sun2)
6. Include housemate reactions to Goldsmith's remarks on the Sussexes, leading to his nomination for eviction by Sharon Osbourne (Source 2)
7. Cover Goldsmith's repeated statement that the Sussexes should lose their royal titles (Source 2, Source 3 Sun2)
8. Include the auction of Prince Harry's underwear, sold for nearly £200,000 to a San Diego strip club owner (Source 1 The Sun, Source 3 Sun2)
9. Cover the buyer's plans to use the underwear as part of a shrine to Prince Harry, describing them as historical from his "playboy days" (Source 3 Sun2)
10. Include OnlyFans banning the seller, Carrie Royale, for threatening to share non-consensual intimate images of Prince Harry (Source 1 The Sun, Source 3 Sun2)
</outline>
`;

  const verbatimExamples = `
EXAMPLE 1:
<outline>
KEY POINTS IN ORDER:
1-3. Include the editor-provided opening that starts with "Navalnaya's call for a polling day protest is a continuation of her husband's political work following his sudden death at a Russian penal colony on 16 February." (Source 1)
4. Cover Kremlin's cause of death claim and supporters' blame on Putin (Source 2 BBCNews, Source 4 The Telegraph)
5. Cover Ukraine's first lady declining to sit next to Navalnaya at State of the Union (Source 2 BBCNews, Source 5 Reuters)
6. Cover Navalny's anti-corruption icon status and clouded legacy in Ukraine (Source 3 WashPo)
7. Include White House's reason for Zelenska's decision (Source 3 WashPo, Source 4 The Telegraph)
8. Include Navalnaya's reason for not attending Biden's address (Source 3 WashPo, Source 4 The Telegraph)
9. Cover Macron urging allies to support Ukraine and discuss sending troops (Source 4 The Telegraph)
10. Include controversy and clarification of Macron's troop comments (Source 3 WashPo, Source 2 BBCNews)
11. Cover criticism from Putin's foreign intelligence chief on Macron's remarks (Source 3 WashPo, Source 5 Reuters)
12. Include context on Russian invasion leading to crisis and nuclear war warning (Source 5 Reuters)
</outline>

EXAMPLE 2: 
<outline>
KEY POINTS IN ORDER:
1-2. Use the editor-provided opening that starts with "MSNBC anchors Jen Psaki, Joy Reid, and Rachel Maddow mocked GOP primary voters in Virginia live on air for considering immigration their top concern." (Source 1)
3. Cover Gallup survey results on Americans citing immigration as the most important issue (Source 2, Source 3 FoxNews)
4. Include MSNBC cutting Trump's speech to fact-check claims on economy and immigration (Source 4 The Raw Story, Source 7 The Telegraph)
5. Cover Joy Reid's criticism of White working-class Republican voters on race and immigration (Source 2)
6. Include Rachel Maddow and Stephanie Ruhle fact-checking Trump's Super Tuesday speech (Source 2, Source 5 Mediate)
7. Cover MSNBC host praising Biden administration on wages and criticizing Trump's pandemic economy (Source 2, Source 4 The Raw Story, Source 6 Breitbart News)
8. Include critics accusing MSNBC of being disconnected from voters' immigration concerns (Source 2, Source 3 FoxNews)
9. Cover backlash against MSNBC from conservatives and anti-Trump figures for mocking segment (Source 3 FoxNews, Source 4 The Raw Story, Source 5 Mediate)
10. Include Trump's pledge in victory speech to tackle illegal border crossings (Source 2)
11. Cover Trump's pledge to close the border and deport people (Source 2, Source 3 FoxNews)
12. Include crowd chants of "USA, USA, USA" during Trump's speech (Source 7 The Telegraph)
13. Cover Republicans busing migrants to locations like New York and Martha's Vineyard (Source 3 FoxNews, Source 6 Breitbart News)
14. Include Van Jones's claim that Democrats can win on immigration with a mainstream position (Source 4 The Raw Story, Source 6 Breitbart News)
15. Cover Trump's primary victories in Virginia with immigration as a top priority for voters (Source 3 FoxNews, Source 6 Breitbart News)
</outline>

EXAMPLE 3:
<outline>
KEY POINTS IN ORDER:
1-3. Use editor-provided opening starting with "Nikki Haley will announce her exit from the Republican presidential race, clearing the path for Donald Trump." (Source 1)
4. Cover Republican voter hesitation to support the GOP candidate in November despite Trump's Super Tuesday success (Source 4 Newsweek, Source 5 The Raw Story)
5. Cover Haley's unexpected victory in Vermont and strong performances in other states (Source 3 The Hill, Source 4 Newsweek)
6. Include Biden campaign's declaration of a "clear path to victory" despite Trump's significant wins on Super Tuesday (Source 2 CNN, Source 4 Newsweek)
7. Cover Biden campaign memo criticizing Trump as "wounded, dangerous, and unpopular" despite his Super Tuesday victories (Source 2 CNN, Source 3 The Hill)
8. Include Biden campaign downplaying concerning poll numbers and focusing on undecided voters (Source 2 CNN)
9. Cover Mitch Landrieu's criticism of Trump's "low energy" and falsehood-filled victory speech (Source 5 The Raw Story, Source 6 WashPo)
10. Cover Democrats beginning to panic as Trump's campaign fails to implode (Source 2 CNN, Source 4 Newsweek)
11. Include Biden trailing Trump in polls, highlighting concerns about his message with swing voters (Source 3 The Hill)
12. Cover Supreme Court's unanimous decision in Trump's favor in a 14th Amendment case (Source 3 The Hill, Source 5 The Raw Story)
13. Include Ukraine's First Lady declining State of the Union invitation due to Navalny's support for Russia's territorial claims (Source 3 The Hill, Source 6 WashPo)
14. Cover Biden preparing for State of the Union address amid a politically divided Congress, highlighting achievements (Source 6 WashPo, Source 7 FoxNews)
15. Include that it will be the latest ever State of the Union address (Source 2 CNN, Source 5 The Raw Story)
</outline>

Example 4:
<outline>
KEY POINTS IN ORDER:
1-3. Use the editor-provided opening that starts with "Gary Goldsmith reveals on Celebrity Big Brother that Kate Middleton is recovering well from her surgery, receiving 'the best care in the world.'" (Source 1)
4. Include Goldsmith's defense of Kate against being called common, highlighting her parents' multimillionaire status (Source 2 The Sun, Source 3, Source 4 Sun2)
5. Cover viewer backlash to Goldsmith's comments on Harry and Meghan, including threats to "switch off" the show (Source 3 GBNews, Source 4 Sun2)
6. Include housemate reactions to Goldsmith's remarks on the Sussexes, leading to his nomination for eviction by Sharon Osbourne (Source 3)
7. Cover Goldsmith's repeated statement that the Sussexes should lose their royal titles (Source 3, Source 4 Sun2)
8. Include the auction of Prince Harry's underwear, sold for nearly £200,000 to a San Diego strip club owner (Source 2 The Sun, Source 4 Sun2)
9. Cover the buyer's plans to use the underwear as part of a shrine to Prince Harry, describing them as historical from his "playboy days" (Source 4 Sun2)
10. Include OnlyFans banning the seller, Carrie Royale, for threatening to share non-consensual intimate images of Prince Harry (Source 2 The Sun, Source 4 Sun2)
</outline>
`;

  return isVerbatim ? verbatimExamples : defaultExamples;
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Create structural outline for aggregated article from source(s).
 */
async function createOutline(request: CreateOutlineRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<CreateOutlineResponse> {
  // 1️⃣ Prepare sources with combined facts ----
  const sourcesWithFacts = buildSourcesWithFactsSplitting(request.sources, request.context.extractedFactsResults, request.context.extractedFactsConditionalResults);

  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.generatedHeadline, request.context.generatedBlobs);

  // 3️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    isVerbatim: hasVerbatimSource(request.sources),
    example_outlines: getExampleOutlines(hasVerbatimSource(request.sources)),
  };

  const userTemplateVariables = {
    headline: request.context.generatedHeadline,
    blobs: headlineAndBlobsText,
    instructions: request.instructions,
    keyPointInstructions: getKeyPointInstructions(sourcesWithFacts.length),
    sources: sourcesWithFacts,
  };

  // 4️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 5️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant
  });

  // 6️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 7️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ createdOutline: aiResult.text }, stepConfig.model, aiResult.usage);
  
  // 8️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { createOutline, type CreateOutlineRequest, type CreateOutlineResponse };
