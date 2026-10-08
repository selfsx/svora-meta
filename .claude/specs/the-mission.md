# The Mission

This repository will serve as the project, database, and agent setup for SVORA NAILS'
(https://svora.place) Meta marketing setup. Let’s initialize this. Here are the initial points:

- We will create marketing campaigns on Meta using the Meta Ads CLI and a System User token.
- We will conduct deep research on competitors and successful Meta campaigns for the nail studio or
  beauty sphere.
- We will create new creatives and copy using source materials and Seedance 2.5 to turn most of the
  source materials into viral, catchy, selling videos.
- We will test the creatives in pack-in campaigns with different optimization goals.

**The main goal is to drive more customers and bookings for SVORA NAILS using Meta as the main
acquisition channel.**

## 1. Deep understanding of the brand and niche

SVORA NAILS is the premium nail studio in Warsaw. A Ukrainian founder founded it, and its main
audience is the Ukrainian, Belarusian, and other Russian-speaking immigrant communities. It also has
English-speaking and native Polish clients. Expanding into the Polish market can also bring in new
clients.

To learn more, explore the site https://svora.place. I also encourage you to explore the materials
in `../svora-landing`; it contains not only the site source but also a lot of material from previous
attempts to start Meta campaigns.

## 2. Market, approaches, and competitors analysis.

To avoid going completely blind, you first need to do deep research on the best way to run campaigns
for this beauty niche and how competitors do this.

My direct approach is to optimize for the InitiateCheckout or Purchase events sent by the Fresha
booking system, but we need to test this.

You need to launch research and store all required information.

## 3. Creatives

Next, create a diverse portfolio of ad creatives to test. The primary source of materials: SVORA
Instagram page: https://www.instagram.com/svora.nails/

We publish all top works and creative videos that can be downloaded, reviewed, processed, and
iterated to produce a few hundred ready-to-upload DLO ad creatives with CTA, body, and metadata.
This will create a diverse portfolio for the tests and BAU campaigns.

> We need to download most of Instagram’s content, so we need research tools that can help us do
> that.

## 4. Texts, overlays, and translations

We have to test several concepts, and each requires a creative ad headline, body, and description.
Localized. Our primary languages are Polish, Ukrainian, Russian, and English.

Source materials usually don't include overlay text, but we can add it, for example, text CTAs,
branding, offers, etc. Either with model or HTML styling plus headless rendering to the result
image.

## 5. Campaigns

Once creative packs are ready, we will start creating the ad campaigns using the Meta Ads CLI.
Specialized agents will create and analyze them. I encourage you to take a look at
`~/Develop/ToonSpace/toonspace-meg` to understand the base. We don't need this kind of massive
machine, of course, because we will start with a few campaigns and a daily budget of about 100-500
PLN.

## 6. Credentials and tools

- CLI: You can use any available tools: Node, ffmpeg, magick, etc. If you're going to write a
  script, it's better to use Node for that. You can use mise to create an initialization file in the
  repository.
- OpenRouter: I’ll provide a key, and you can use any models you need to create a creative
  portfolio, like Nano Banana, Seedance, etc.
- System User Token: I’ll provide it.
- Fonts: Check the site and the site source repo. You’ll find the brand kit in there.

> Most of the credentials will be stored in the gitignored .env file.

## Final Notes

- Initialize this repository as a `git-lfs` repository, because we will store final creatives here.
- In this repository, you fully define the structure in AGENTS.md and the .claude directory.
  Initialize the agents you’ll need for the work, and install skills and commands. Use npx skills to
  find the required skills.
- Build the plans and store the required specs so we can iterate successfully in this repository
  with other context and agents repeatedly. Think about a maintainable folder and file structure.
