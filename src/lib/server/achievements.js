export const achievementDefinitions = {
  "1sub": {
    id: "1sub",
    type: "subs",
    target: 1,
    title: "Der erste Fan",
    description: "Erreiche 1 Abonnenten",
    icon: "monitor-play",
    reward: { type: "coins", value: 100 }
  },
  "5sub": {
    id: "5sub",
    type: "subs",
    target: 5,
    title: "Endlich 5 Abonnenten",
    description: "Erreiche 5 Abonnenten",
    icon: "star",
    reward: { type: "coins", value: 300 }
  },
  "10sub": {
    id: "10sub",
    type: "subs",
    target: 10,
    title: "Abo-Mogul",
    description: "Erreiche 10 Abonnenten",
    icon: "trophy",
    reward: { type: "coins", value: 500 }
  },
  "5commentlike": {
    id: "5commentlike",
    type: "commentlikes",
    target: 5,
    title: "Cualquier pronombre",
    description: "Verfasse einen Kommentar mit 5 Likes",
    icon: "message-square",
    reward: { type: "coins", value: 500 }
  },
  "5namecolors": {
    id: "5namecolors",
    type: "namecolors",
    target: 5,
    title: "Farbenfröh",
    description: "Besitze 5 Namensfarben",
    icon: "palette",
    reward: { type: "namecolor", value: "rainbow" }
  },
  "1000views": {
    id: "1000views",
    type: "totalviews",
    target: 1000,
    title: "Influenza",
    description: "Erreiche 1000 Views",
    icon: "play",
    reward: { type: "coins", value: 500 }
  }
};

export function isAchievementCompleted(definition, stats) {
  if (definition.type === "subs") {
    return stats.subs >= definition.target;
  }
  if (definition.type === "namecolors") {
    // add one for default
    return stats.namecolors + 1 >= definition.target;
  }
  if (definition.type === "commentlikes") {
    return stats.maxcommentlikes >= definition.target;
  }
  if (definition.type === "totalviews") {
    return stats.totalviews >= definition.target
  }

  return false;
}

export function getAchievementProgress(definition, stats, collected) {
  let currentValue = 0;

  if(definition.type == "subs"){
    currentValue = stats.subs ?? 0;
  }
  if(definition.type == "namecolors"){
    // add one for default
    currentValue = (stats.namecolors ?? 0) + 1;
  }
  if(definition.type == "commentlikes"){
    currentValue = stats.maxcommentlikes ?? 0;
  }
  if(definition.type == "totalviews"){
    currentValue = stats.totalviews ?? 0;
  }

  return {
    ...definition,
    value: Math.min(currentValue, definition.target),
    max: definition.target,
    completed: isAchievementCompleted(definition, stats),
    collected: collected.includes(definition.id)
  };
}
