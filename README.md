## SenfTube
An open-source video-centered social media platform built with Sveltekit, Postgres and Cloudflare Stream

## Setup
1. Enter values in .env (as in .env.example)
2. Enter the default profile picture id in /api/user/update/image and in lib/server/db/auth.schema.js
3. Run `npm run db:push` to seed the database

### Guide
How to add Emojis?
> Go to lib/components/self/LinkText.svelte and add to the emojis variable.

How to add Badges?
> Go to /api/badge/equip/+server.js and add the badge id to the array at the end of the file
> Go to /api/badge/order/+server.js and append the badge to the shop array at the end of the file
> Follow the instructions on /user/[user]/+page.svelte and /shop

How to add Achievements?
> Look at the examples in lib/server/achievements.js
> To add an achievement, append this to `achievementDefinitions`
```
  "ACHIEVEMENT_ID": { // replace with id
    id: "ACHIEVEMENT_ID", // replace with id
    type: "subs", // can be one of subs, commentlikes, namecolors or totalviews
    target: 1, // target value, for example one sub 
    title: "Der erste Fan", // label
    description: "Erreiche 1 Abonnenten",
    icon: "monitor-play", // can be one of monitor-play, star, trophy, message-square, palette, play
    reward: { type: "coins", value: 100 } // type can be one of coins, namecolor
  },
```
