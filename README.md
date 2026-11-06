# Green Shopping Companion: Idea Overview

**Tagline:** Shop close, travel smart, see your carbon before you go.

**The problem:** People choose where to shop by price and habit, and never see the carbon cost of getting there. The information exists, but not at the moment of decision.

**Name ideas:** GreenStep, NearbyZero, CarbonCompass, ShopLoop, Footprint Finder. Working title for now: Green Shopping Companion.

A browser extension or web app that helps people pick the lowest-carbon way to buy things, by showing nearby stores, route options, and the emissions difference at the moment of decision.

**Context:** Concept for the carbon-reduction workshop in Bucharest, Romania (simulation, lectures, exercises, pitching).

**Current rating:** 7/10 as originally described, with a clear path to 10/10 (see improvements below).

## The Core Idea

1. The user is about to buy something (shoes, underwear, jeans, a bra, anything).
2. A list of brands appears, or the user can simply browse all nearby stores.
3. After picking a brand (e.g. Adidas), the tool shows the nearest shops based on the user's location.
4. It calculates the carbon emissions of each option and shows how much the user saves by choosing the closer or greener one.
5. It suggests the route: bus, then train, then a short walk, or cycling if that is better.

## Feasibility

- Building a full browser or JavaScript engine is extremely hard and unnecessary. Nobody would switch browsers just to shop.
- A **browser extension** or a **simple web app** can do everything described and can be prototyped quickly.
- Free data sources exist: open map data, routing services, and published emission factors per transport mode.

## Features

### Core (MVP)

- Location permission and nearby store search
- Brand picker or "just browse" mode
- Emissions estimate per trip (walk, bike, bus, train, car)
- Route suggestions with the greenest option highlighted
- CO2 saved shown versus a default such as driving

### Upgrades (path to 10/10)

- **Honest comparison:** include online delivery and returns, since a returned parcel can erase the savings
- **Product footprint:** rough per-brand or per-item emissions so the trip is seen as only part of the story
- **Motivation layer:** personal carbon budget, streaks, monthly summaries, friendly leaderboards, local shop coupons for green choices
- **Business model:** local shops pay to be featured as low-carbon options; cities or companies use anonymised data for transport planning

## Benefits

- Makes an invisible cost (carbon) visible at the exact moment of decision
- Easy to explain and demo in a short pitch
- Low technical barrier: extension or web app, free data
- Win-win for users (savings, health, convenience), local shops (foot traffic), and cities (fewer car trips)
- Scalable through partnerships rather than individual downloads

## Flaws and Fixes

| Flaw | Why it could fail | Fix |
| --- | --- | --- |
| Nobody installs it | People already use Google Maps or Amazon; new tools get ignored | Start as a lightweight extension that appears where people already shop; pilot through a campus or city programme |
| Shaky numbers | One critic can discredit imprecise emissions estimates | Use published emission factors, show ranges instead of fake precision, cite sources openly |
| Savings feel tiny | A few hundred grams of CO2 per trip is not exciting | Show cumulative impact (monthly, neighbourhood-wide) and focus on bigger decisions like skipping a car trip |
| Local shops do not join | Thin data and few choices | Use public map data first, no partnerships needed; invite shops later with a clear benefit |
| Location privacy | Location plus shopping intent is sensitive, especially in Europe | Process on-device where possible, store nothing, state it clearly |

**Deadliest flaw:** distribution. Rule of thumb: do not ask people to go somewhere new, show up where they already are.

## Distribution Plan

1. Browser extension with a small panel on search and shop pages (zero new habits, one-click install)
2. Borrow existing audiences: a university, a city sustainability office, or a company green programme
3. Retention: monthly summaries, leaderboards, local discounts
4. Consider B2B first: retailers and cities have a reason to promote it, and users follow

## Suggested Workshop Pitch

- **Demo:** one side-by-side comparison for a single purchase with real numbers (walk, bus, car, online delivery)
- **First step:** a campus pilot with around five thousand students
- **Scale story:** retailer partnerships and city transport data, not just individual downloads
- **Credibility:** transparent sources and privacy-first design

## Next Steps

- Pick the demo purchase and 3 to 5 real shops in Bucharest or Nuremberg
- Gather emission factors per transport mode from a published source
- Sketch the extension panel UI
- Draft a 3-minute pitch around the single comparison demo

## Competitors and Differentiation

The tool sits between three existing categories, and none of them combines shopping intent, nearby stores, and carbon comparison in one place.

| Existing tool | What it does | What it lacks |
| --- | --- | --- |
| Google Maps eco-friendly routing | Picks fuel-efficient driving routes | Does not know what you are buying; no store comparison by carbon |
| Carbon footprint trackers (e.g. personal CO2 apps) | Log your footprint after the fact | Not shown at the moment of decision; manual input |
| Shopping and price-comparison extensions | Compare price across shops | Ignore distance and emissions entirely |

**Our angle:** carbon shown at the exact moment of choosing where to shop, combined with the real alternative of walking, cycling, public transport, or ordering online.

## Example Calculation

Buying one pair of shoes from a store 3 km away. Figures are approximate, in the range of published average per-passenger factors (the UK government publishes a yearly set, and rail is around 0.03 kg CO2e per passenger-km in the 2026 edition). The final tool should pull exact values from a cited source.

| Option | Approx. emissions per km (g CO2e) | 3 km one way | Round trip (6 km) |
| --- | --- | --- | --- |
| Walking or cycling | about 0 | about 0 g | about 0 g |
| Train or tram | about 30 to 40 | about 90 to 120 g | about 180 to 240 g |
| Bus (per passenger) | about 90 | about 270 g | about 540 g |
| Petrol car (one person) | about 170 | about 510 g | about 1,020 g |

The point for the pitch: the same shoes can cost about 1 kg of CO2 to fetch by car, or almost nothing on foot. The tool also needs to flag that a far-away store reached by car can be worse than a delivery van serving many homes.

## Pilot Success Metrics (Campus Pilot)

| Metric | What it tells us | Example target |
| --- | --- | --- |
| Installs | Is there any demand | 500 in the first month |
| Weekly active users | Is it a habit | 30 percent of installs |
| Trips changed | Did the nudge work (user picks a greener option than their default) | 20 percent of searches |
| kg CO2 saved | Headline impact number for the pitch | Tracked cumulatively |
| Shops clicked or visited | Value for local retailers | Tracked per shop |

Targets are placeholders to be adjusted after the first test.

## Technical Stack (Start Building Now)

### Architecture in one line

A browser extension (front end) calls a small backend, which pulls map and routing data and applies emission factors, then returns a ranked list of options.

### Front end

- **Browser extension** using Manifest V3 (works in Chrome, Edge, Brave; Firefox support with small changes)
- **React with TypeScript** for the popup and side panel, bundled with **Vite** and the CRXJS plugin or WXT framework
- **Tailwind CSS** for fast styling
- **MapLibre GL JS** for the map view (open source, no API fees)
- A fallback **web app version** using the same React code, useful for the live demo

### Backend

- **Node.js with TypeScript** and Fastify or Express, or **Python with FastAPI** if you prefer Python
- Hosted on **Vercel, Cloudflare Workers, or Fly.io** (free tiers are enough for a prototype)
- A simple **emission-factor table** stored as a JSON file at first, later in **Postgres or Supabase**

### Data sources (mostly free)

- **Nearby stores:** OpenStreetMap through the Overpass API or Nominatim (free), with the Google Places API as a paid upgrade
- **Routing and travel time:** OpenRouteService, OSRM, or Valhalla for walking, cycling, and driving; **GTFS feeds** or the **Transitous / MOTIS** project for public transport
- **Emission factors:** the UK government GHG conversion factors (published yearly) or the European Environment Agency figures, cited in the app
- **Geocoding:** Nominatim or Photon

### Privacy by design

- Ask for location only on click, not in the background
- Process location on the device where possible and send only a rounded area to the backend
- No accounts and no stored history in the first version

### Build order (first weekend)

1. Web app: type a shop type, get location, list nearby OpenStreetMap shops
2. Add routing for walk, bike, and car; show distance and time
3. Add the emission-factor table and show grams of CO2 per option, with the greenest highlighted
4. Add public transport through a GTFS or MOTIS source
5. Wrap the same UI as a browser extension with a side panel
6. Add the online-delivery comparison and the monthly summary

### Using an AI coding assistant

Start by giving your coding tool this document as the spec, then ask it to scaffold step 1 only. Keep each step small, run it, and commit before moving on.

## What Already Exists (Research)

A quick search of browser extensions, Devpost and GitHub shows the space is active but fragmented. The gap is the same each time: nobody combines shopping intent, nearby physical stores, and a multi-mode carbon comparison.

| Project | What it does | Takeaway for us |
| --- | --- | --- |
| [EcoCart](https://thetravelbugbite.com/2021/03/09/ecocart/) | Chrome extension that pops up on participating online stores and offsets order emissions | Proves users accept a shopping popup; it focuses on online orders and offsetting, not on store choice or travel |
| [CarbonGuru](https://addons.mozilla.org/en-US/firefox/addon/carbonguru/) | Extension showing footprints for product pages, carts and receipts | Covers the product footprint idea; ignores the trip to the store |
| [CarbonKarma (Devpost)](https://devpost.com/software/carbonkarma) | Hackathon extension informing users of emissions from production, packaging and transport of online purchases | Shows the idea works as a hackathon pitch; online-only |
| [Carbon Footprint extension by OiWorld](https://github.com/saisankargochhayat/carbonfootprint) | Calculates CO2 for routes suggested by Google Maps, Here and OpenStreetMap | Closest technical relative: reuse its approach to route emissions instead of rebuilding it |
| [Internet Ecosystem extension](https://github.com/Internet-Ecosystem-Team/internet-ecosystem-extension) | Adds a rating to eBay items based on the distance the item travelled | Shows a simple rating overlay on a shopping site is feasible |
| [EcoTransit CO2 (GitHub topic)](https://github.com/topics/co2-emissions?l=javascript) | Web app comparing the footprint of different transport modes | Useful reference for the comparison UI |
| [Commons](https://www.howtogeek.com/these-apps-helps-me-track-my-impact-on-the-earth/) | App that rates sustainable clothing brands | A possible partner or data source for brand-level footprints |

**What we should reuse:** open-source route-emission logic from the existing Carbon Footprint extension, the popup pattern from EcoCart, and the distance-rating overlay idea.

**Our gap to own:** the moment of choosing where to shop, with real nearby stores and walk, bike, transit, car and delivery side by side.

**Not yet covered:** Reddit. Two targeted searches returned no Reddit threads on this exact idea, so there is no verified Reddit evidence here. A manual look at subreddits like r/sustainability, r/ZeroWaste and r/Anticonsumption for user pain points is still worth doing before the pitch.

## Evidence: Store vs Online Delivery

The public debate shows the answer depends on how you travel, so a tool that compares options honestly has real value. These findings come from the articles below, not from our own data.

- **Walking, cycling or transit favour the store.** One analysis says that if you shop on foot, by bicycle, or by public transport, in-store shopping will most likely be the greener option ([World Cleanup Day](https://www.worldcleanupday.org/post/shopping-online-vs-shopping-in-store-which-is-more-sustainable)).
- **Driving often favours delivery.** A widely reported analysis found that in-store footprints per item were higher than those of retailers combining stores and online in 63% of shopping events ([CNN Business](https://www.cnn.com/2020/02/26/tech/greenhouse-gas-emissions-retail/index.html)).
- **Local store delivery can win.** Scientific American reported that having a physical store deliver was most often the greenest method, though the ranking shifted a great deal with circumstances ([Scientific American](https://www.scientificamerican.com/article/delivery-from-local-store-is-greenest-shopping-method-most-of-the-time1/)).
- **Full-vehicle delivery halves the emissions.** One source says that waiting for a nearly full delivery vehicle can produce half the emissions of driving to a local store ([Food Revolution Network](https://foodrevolution.org/blog/sustainable-online-shopping/)).

**What this means for the product:** do not assume that closer is always greener. The honest comparison of walk, bike, transit, car and delivery is the feature that makes the tool credible, and a good answer to "why not just order online?" at the pitch.

## Global Context: Who Emits the Most

The problem is global, but it looks very different depending on whether you count total emissions or emissions per person. Figures are for 2024 and come from the Global Carbon Project data as summarised by the sources linked below; verify exact numbers before the pitch.

| View | Country | Figure | Why it matters for us |
| --- | --- | --- | --- |
| Highest total | China | about 12.3 billion tonnes CO2, about 32% of the world total ([Coffset](https://coffset.org/carbon-footprint-by-country-2026)) | Biggest absolute impact, but a huge and varied market |
| Highest per person (large countries, over 20 million people) | Saudi Arabia, Australia, United States | 20.4, 14.5 and 14.2 tonnes per person ([GreenCalculus](https://greencalculus.com/data/co2-emissions-by-country/)) | Car-dependent lifestyles, where a shopping-trip nudge has the most room to change habits |
| Highest per person (any size) | Qatar and Kuwait | Ranked first and second per person, despite ranking 35th and 40th in total ([The Global Statistics](https://www.theglobalstatistics.com/carbon-emissions-by-country/)) | Small, fuel-producing states, so not a realistic target market |
| Lowest per person | Somalia, DR Congo, Burundi, Niger, Chad (near the bottom of the ranking) | Somalia is the lowest among low-income countries at about 0.05 tonnes per person, against about 2.5 for the highest in that group, North Korea (\[TheGlobalEconomy\](https://www.theglobaleconomy.com/rankings/Carbon\_dioxide\_emissions\_per\_capita/WB-low/)). Exact ranks vary by source; see the [Our World in Data per-capita chart](https://ourworldindata.org/grapher/co-emissions-per-capita) | Low-emission countries are usually low-income, with little shopping-trip driving to reduce |

**Read this as:** the biggest total emitter and the biggest per-person emitters are different stories. Our tool targets per-person, daily-behaviour emissions, so it matters most where people drive a lot and have real alternatives.

**The scale of the gap:** the lowest countries emit well under one tonne per person, while the highest large countries emit 14 to 20 tonnes. A single average person in Saudi Arabia emits as much as several hundred people in Somalia, which is why the tool aims at high-use, high-choice markets rather than at the countries that emit least.

## Where the Idea Works Best

The tool needs three things to work: good open map and transit data, a real choice between modes, and shops that are close enough to walk or ride to. This is our reasoning, not a sourced ranking.

| Market | Fit | Reasoning |
| --- | --- | --- |
| Germany | Very strong | Excellent public transport data (GTFS feeds), dense cities, strong cycling culture, high environmental awareness, and the founder lives here, so it is easy to pilot at FAU |
| France | Strong | Good open transport data, national climate policies, large cities with dense retail |
| Netherlands, Denmark, Sweden | Strong | Cycling-first cities where the greener option is already convenient, so users are likely to act on the nudge |
| United States, Australia | High need, harder execution | Highest per-person emissions among big countries, so the most room to reduce, but car-dependent, spread-out cities mean fewer realistic alternatives |
| India and fast-growing cities | Long-term | Huge scale and growing retail, but weaker open transit data and a very different market |

**Recommendation:** pilot in Germany (Nuremberg, via the university), use France and the Nordics as the first expansion, and keep high-emission, car-dependent countries as the long-term impact story.

## Suggestions to Make It a Winner

These are my recommendations, ordered by how much they would strengthen the pitch.

1. **Lead with one real story.** Open the pitch with a single purchase in Nuremberg: same shoes, three ways to get them, three carbon numbers. A concrete example beats any statistic.
2. **Be the honest tool.** The evidence shows that closer is not always greener, so say this openly. Being willing to recommend delivery when it wins builds trust and sets you apart from greenwashing apps.
3. **Show money and time too.** Add cost and travel time next to carbon. Most people act on saving money or time, and carbon becomes the bonus.
4. **Think about the retailer, not only the shopper.** A shopping street or a city can pay for footfall data and promotion, which gives you a revenue story.
5. **Plan for data quality.** State your emission factors, your source and your margin of error openly, and let users correct a wrong store or route.
6. **Pick a sharp first user.** Students at FAU who walk, cycle and use transit already are the easiest pilot, and they reach the second-hand and clothing shops where the idea fits best.
7. **Prepare for tough questions.** Why would anyone change habits for a few hundred grams of CO2? Why you and not Google Maps? Have a one-sentence answer for each.

## Big Brand Angle (Adidas and Similar)

Large brands such as Adidas have structured store data, product footprints and sustainability teams. They could be partners instead of just entries in a list. This is a hypothesis to test, not a confirmed partnership.

- **Store data:** official store locators and stock data would make results more accurate than scraped map data.
- **Product footprint:** brands that already report product-level emissions could supply the second half of the picture, beyond the trip.
- **Why they might join:** footfall to their own physical stores, a sustainability story for customers, and a possible link to their climate targets.
- **Risk:** big brands may want control over how they are compared. Keep the comparison transparent and brand-neutral.
- **Practical first step:** pitch a pilot to one regional retailer or shopping street before approaching a global brand.

## Sources

- [EcoCart review](https://thetravelbugbite.com/2021/03/09/ecocart/)
- [CarbonGuru on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/carbonguru/)
- [CarbonKarma on Devpost](https://devpost.com/software/carbonkarma)
- [Carbon Footprint extension on GitHub](https://github.com/saisankargochhayat/carbonfootprint)
- [Internet Ecosystem extension on GitHub](https://github.com/Internet-Ecosystem-Team/internet-ecosystem-extension)
- [GitHub topic: co2-emissions](https://github.com/topics/co2-emissions?l=javascript)
- [How-To Geek: 8 apps to track your impact](https://www.howtogeek.com/these-apps-helps-me-track-my-impact-on-the-earth/)
- [UK government GHG conversion factors, 2026 methodology](https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf)

* [World Cleanup Day: online vs in-store](https://www.worldcleanupday.org/post/shopping-online-vs-shopping-in-store-which-is-more-sustainable)
* [CNN Business: online shopping vs driving](https://www.cnn.com/2020/02/26/tech/greenhouse-gas-emissions-retail/index.html)
* [Scientific American: delivery from local store](https://www.scientificamerican.com/article/delivery-from-local-store-is-greenest-shopping-method-most-of-the-time1/)
* [Food Revolution Network: sustainable online shopping](https://foodrevolution.org/blog/sustainable-online-shopping/)

- [Our World in Data: CO2 emissions per capita](https://ourworldindata.org/grapher/co-emissions-per-capita)
- [Coffset: carbon footprint by country 2026](https://coffset.org/carbon-footprint-by-country-2026)
- [GreenCalculus: CO2 emissions per person by country](https://greencalculus.com/data/co2-emissions-by-country/)
- [The Global Statistics: carbon emissions by country](https://www.theglobalstatistics.com/carbon-emissions-by-country/)
