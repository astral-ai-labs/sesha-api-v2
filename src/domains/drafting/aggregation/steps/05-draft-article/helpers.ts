/* ==========================================================================*/
// helpers.ts — Draft article helper functions for aggregation
/* ==========================================================================*/
// Purpose: Aggregation-specific helpers for multi-source article generation
// Sections: Imports, Constants, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { LengthRange } from "@/domains/drafting/common/types/_primitives";

/* ==========================================================================*/
// Constants
/* ==========================================================================*/

const WORD_TARGET_MAP: Record<LengthRange, number> = {
  "100-250": 100,
  "400-550": 400,
  "700-850": 1000,
  "1000-1200": 1200,
};

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Get word target based on length range for aggregation articles.
 */
function getWordTarget(lengthRange: LengthRange): number {
  return WORD_TARGET_MAP[lengthRange];
}

/**
 * Get example aggregation articles based on target word count for AI guidance.
 */
function getExampleArticles(wordTarget: number): string {
  if (wordTarget === 100) {
    return `
Example 1 (this is just an example aggregation article):
<example-article>
Mole Valley District Council has revoked the premises license for Rise and Shine supermarket in Dorking after receiving multiple reports of illegal activity, including underage sales, illicit tobacco, and nitrous oxide. (Source 1)

The Council's Licensing Sub-Committee held a hearing on February 9, 2023, attended by representatives from Mole Valley District Council, Surrey Police, Buckingham & Surrey Trading Standards, and County Child Employment Enforcement & Strategy, who all supported revoking the license, according to the hearing report. (Source 1)

The Sub-Committee was convinced there were likely sales of illicit tobacco, nitrous oxide, as well as out of hours and underage sales at the premises, undermining the Licensing Objectives of preventing crime and protecting children from harm. (Source 1)

An anonymous party provided evidence of after hours sales and possible drug sales, which the Sub-Committee gave "considerable weight" to while noting the person wished to remain anonymous "for fear of reprisals," the hearing notes said. (Source 2)

The witness said: "These new owners of the rise and shine, they are nothing but bad news! they are dealing drugs and laughing gas (nitrous oxide cans)". (Source 2)

The sub-committee also heard that, despite undertakings from the owner, staff had a poor grasp of english and failed to carry ID proving their right to work in the UK. (Source 3)

The decision said that the Sub-Committee decided revoking the premises licence was the only step that would remedy the failure to uphold the Licensing Objectives, with a 21-day window to appeal the decision. (Source 1)
</example-article>

Example 2 (this is just an example aggregation article):
<example-article>
A study published in the European Heart Journal revealed that women infected with high-risk strains of human papillomavirus (HPV) have a four times greater risk of dying from cardiovascular disease. (Source 1)

This is the first study to demonstrate a connection between high-risk HPV infection and cardiovascular disease mortality, according to the European Heart Journal. (Source 1)

Women with high-risk HPV had a 3.91 times higher risk of blocked arteries, a 3.74 times higher risk of dying from heart disease, and a 5.86 times higher risk of dying from stroke compared to women without high-risk HPV infection. (Source 1)

The risk was even higher in women with both high-risk HPV infection and obesity, according to a follow-up analysis. (Source 2)

Prof. Hae Suk Cheong suggested that HPV may trigger inflammation in blood vessels, contributing to blocked and damaged arteries and increasing cardiovascular disease risk. (Source 1)

"If these findings are confirmed, they could have substantial implications for public health strategies. Increasing HPV vaccination rates may be an important strategy in reducing long-term cardiovascular risks," Prof. Ryu added. (Source 3)
</example-article>
`;
  } else if (wordTarget === 400) {
    return `
Example 1 (this is just an example aggregation article):
<example-article>
Researchers at UCLA have discovered a brain circuit in mice that, when activated, causes them to seek out fatty foods even when not hungry. (Source 1)

The study, published in Nature Communications, found that stimulation of specific brain cells called vgat PAG cells causes mice to compulsively forage for high-calorie foods, even enduring foot shocks to reach them. (Source 1)

The finding offers new insights into the neurological underpinnings of compulsive eating behaviors and could lead to new treatment targets for eating disorders in humans. (Source 1)

Corresponding author Avishek Adhikari, a UCLA associate professor of psychology, explains that the periaqueductal gray (PAG) region in the brainstem is functionally similar between humans and mice. (Source 1)

"Although our findings were a surprise, it makes sense that food-seeking would be rooted in such an ancient part of the brain, since foraging is something all animals need to do," added Adhikari. (Source 1)

The researchers discovered that activation of the entire PAG region causes a panic response, but selectively stimulating only the vgat PAG cells did not alter fear and instead caused foraging and feeding. (Source 1)

Humans also possess vgat PAG cells, and an overactive circuit could potentially drive cravings even when not hungry, while an under-stimulated circuit could lead to less interest in eating when hungry. (Source 2)

"We're doing new experiments based on these findings and learning that these cells induce eating of fatty and sugary foods, but not of vegetables in mice, suggesting this circuit may increase eating of junk food," said Fernando Reis, a UCLA postdoctoral researcher who conducted most of the experiments in the study. (Source 1)

Remarkably, the mice were so driven to eat fatty foods that they were willing to endure foot shocks to reach them, suggesting the circuit causes cravings rather than mere hunger. (Source 1)

When the vgat PAG cells were stimulated, the mice went after live crickets and other non-prey food, even after having just eaten a meal. They also chased moving objects that weren't food at all, like ping pong balls. (Source 1)

Adhikari states, "The results suggest the following behavior is related more to wanting than to hunger. Hunger is aversive, meaning that mice usually avoid feeling hungry if they can. But they seek out activation of these cells, suggesting that the circuit is not causing hunger." (Source 1)

On the other hand, inhibiting the activity of the vgat PAG cells using an engineered virus reduced the mice's desire to seek out food, even when they were hungry. (Source 3)

While reasons for overeating and undereating in humans are varied, the author notes this growing area of research could help answer some questions in certain circumstances. (Source 2)

People who eat even when they're not hungry often describe it as "mindless" eating attributed to stress, boredom, or just wanting to taste things. (Source 2)
</example-article>
`;
  } else if (wordTarget === 1000) {
    return `
Example (this is just an example aggregation article):
<example-article>
Prime Minister Rishi Sunak challenged voters to stick with him in a GB News People's Forum on Monday. (Source 1)

"Do we stick with this plan? Our plan that is starting to deliver the change that you all want and the country deserves? Or do we go back to square one with Keir Starmer and the Labour Party?" Sunak said, contrasting his agenda with what he called Labour's lack of one, according to GBNews. (Source 1)

Sunak highlighted progress on his five key priorities: halving inflation, growing the economy, reducing debt, cutting NHS waiting lists, and reducing illegal migrant boats. (Source 1)

He noted that inflation has been more than halved, the economy is outperforming expectations, debt is on track to fall, the longest NHS waits have been eliminated, and illegal Channel crossings are down by a third. (Source 1)

Responding to a question about whether the Conservatives have delivered anything of substance since their 2019 election win, Sunak pointed to investment and job creation in Teesside, a new Treasury campus in Darlington, and infrastructure improvements as examples of the government's "levelling up" agenda. (Source 1)

On the NHS, Sunak acknowledged the damage and backlogs caused by COVID but outlined investments in more doctors, nurses, and healthcare facilities. (Source 1)

Meanwhile, critics have questioned the effectiveness of these policies, with opposition leaders arguing that the promised improvements have been too slow to materialize. (Source 2)

"We want to make sure that people whatever their background, are respected and treated with dignity. That's the kind of country that I believe in," Sunak stated regarding LGBT issues. (Source 1)

According to GB News, he said the Conservatives legalized same-sex marriage and want to be sensitive and understanding on transgender issues while also considering biological sex for women's safety and health. (Source 1)

Sunak argued the next election is a straightforward choice between him and Labour leader Keir Starmer for Prime Minister. (Source 1)

In the forum, he criticized Labour for lacking a plan, citing "absolute chaos" over their decarbonization policy and Starmer standing by a candidate accused of anti-Semitism until media pressure forced a reversal. (Source 1)

On housing, Sunak said the government is on track to deliver a million new homes this Parliament, has cut stamp duty for first-time buyers, and tried to change "defective" EU environmental rules blocking 100,000 homes, which Labour opposed in the Lords. (Source 1)

However, housing advocates have argued that the pace of construction still falls short of demand, particularly for affordable housing options. (Source 3)

Regarding energy security, Sunak said the government is building new nuclear power, investing in renewables like offshore wind, and continuing to issue North Sea oil and gas licenses, which he said is better than importing it from abroad. (Source 1)

He criticized Labour for opposing the licenses, according to the GB News forum. (Source 1)

Environmental groups have expressed concern about the continued focus on fossil fuel extraction, arguing it contradicts climate commitments. (Source 3)

Sunak strongly criticized Labour's plan to charge independent schools VAT, saying it would hurt middle-income families who make sacrifices to invest in their children's education. (Source 1)

"You're not really attacking me, you're attacking my parents, and you're attacking everybody like them that works hard to aspire for a better life for them and their family. I think that's wrong. I don't think it's British," he said. (Source 1)

The Prime Minister said Conservative MPs are united in wanting to deliver a country where "your children can look forward to a brighter future," "you have that peace of mind," and "we can have a renewed sense of pride in your country." (Source 1)

He contrasted that vision with Labour's, GB News wrote. (Source 1)

On Scotland, Sunak said Scots earning over £28,000 now pay higher taxes than in England because of the SNP government's recent budget. (Source 1)

He contrasted that with the Conservatives' approach of controlling inflation and borrowing first, then cutting taxes like national insurance. (Source 1)

"If we stick with it, then there are better times ahead," Sunak argued, saying inflation and mortgage rates are falling while wages are rising. (Source 1)

He claimed Starmer can't say how he'd pay for his policies, meaning "higher taxes" and going "back to square one with the Labour Party." (Source 1)

Keith from Edinburgh asked about radical reform of the chronically underfunded social care system. (Source 1)

Sunak said the government recently announced an extra £600 million for local councils, with most earmarked for social care. (Source 1)

While not an overnight fix, he said they are working to better integrate social care with hospitals, according to the forum writeup. (Source 1)

Political analysts noted that the forum represents part of Sunak's broader strategy to connect directly with voters ahead of the upcoming election. (Source 2)
</example-article>
`;
  } else {
    return `
Example (this is just an example aggregation article):
<example-article>
A comprehensive news aggregation example would go here for longer articles, weaving together multiple sources with proper attribution and maintaining the flow between different perspectives and developments from various sources. (Source 1, Source 2, Source 3)
</example-article>
`;
  }
}

/**
 * Prepare sources for aggregation template variables.
 */
function prepareSources(extractedFactsResults: Array<{ sourceNumber: number; extractedFacts: string }>, extractedFactsConditionalResults: Array<{ sourceNumber: number; factsBitSplitting2: string }>, sources: any[]): any[] {
  return sources.map((source, index) => {
    const sourceNumber = index + 1;
    const extractedFacts = extractedFactsResults.find(r => r.sourceNumber === sourceNumber);
    const conditionalFacts = extractedFactsConditionalResults.find(r => r.sourceNumber === sourceNumber);
    
    return {
      ...source,
      factsBitSplitting1: extractedFacts?.extractedFacts || "",
      factsBitSplitting2: conditionalFacts?.factsBitSplitting2 || "",
      accredit: source.attribution || `Source ${sourceNumber}`,
    };
  });
}

/**
 * Generate sentence guidance based on word target for aggregation articles.
 */
function getSentenceGuidance(wordTarget: number): string {
  if (wordTarget <= 250) {
    return "Write concise, punchy sentences that integrate facts from multiple sources efficiently.";
  } else if (wordTarget <= 550) {
    return "Balance detail with readability, ensuring smooth transitions between sources while maintaining narrative flow.";
  } else if (wordTarget <= 850) {
    return "Provide comprehensive coverage with rich detail from all sources, using varied sentence structures to maintain reader engagement.";
  } else {
    return "Create a thorough, in-depth article that extensively weaves together all source materials with sophisticated narrative structure and comprehensive coverage of all angles.";
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  getExampleArticles,
  getWordTarget,
  prepareSources,
  getSentenceGuidance,
};
