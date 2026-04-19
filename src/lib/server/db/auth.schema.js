import { relations, sql } from "drizzle-orm";

import {
    pgTable,
    primaryKey,
    serial,
    integer,
    text,
    timestamp,
    boolean,
    index
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    atHandle: text('at_handle'),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image").default("9f99e3d5-a3be-444b-8247-13b53bfa4600"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate((/* @__PURE__ */) => new Date()).notNull(),
    bio: text('bio').default('#1 SenfTube Fan'),
    nameColor: text("name_color").default("default"),
    coins: integer("coins").default(100),
    verified: boolean("verified").default(false),
    lastUploadedVideo: timestamp("lastUploadedVideo"),
    lastCommented: timestamp("lastCommented"),
    streak: integer("streak").default(0),
    maxStreak: integer("maxStreak").default(0),
    role: text('role').default('user')
});

export const pinnedVideos = pgTable("pinned_videos", {
    id: integer("id").primaryKey(),
    pinned: boolean("pinned").default(false)
})

export const inventory = pgTable(
    'inventory',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        item: text('item').notNull()
    },
    (table) => [primaryKey({ columns: [table.user, table.item] })]
);

export const badgeInventory = pgTable(
    'badge_inventory',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        badgeId: text('badge_id').notNull()
    },
    (table) => [primaryKey({ columns: [table.user, table.badgeId] })]
);

export const badgeEquips = pgTable(
    'badge_equips',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        badgeId: text('badge_id').notNull(),
        equipped: boolean('equipped').default(true)
    },
    (table) => [primaryKey({ columns: [table.user, table.badgeId] })]
);

export const streakRewards = pgTable(
    'streak_rewards',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        rewardDays: integer('reward_days').notNull()
    },
    (table) => [primaryKey({ columns: [table.user, table.rewardDays] })]
);

export const collectedAchievements = pgTable(
    'collected_achievements',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        achievement: text('achievement').notNull()
    },
    (table) => [primaryKey({ columns: [table.user, table.achievement] })]
);

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").$onUpdate((/* @__PURE__ */) => new Date()).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
    },
    (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").$onUpdate((/* @__PURE__ */) => new Date()).notNull()
    },
    (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate((/* @__PURE__ */) => new Date()).notNull()
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), accounts: many(account) }));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const giftCodes = pgTable('giftcodes', {
    id: text('id').primaryKey(),
    value: integer('value')
});

export const giftCodeUsages = pgTable(
    'giftcodeusages',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        code: text('code').notNull().references(() => giftCodes.id, { onDelete: 'cascade' })
    },
    (table) => [primaryKey({ columns: [table.user, table.code] })]
);

export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    views: integer('views').default(0),
    user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
    thumbnail: text('thumbnail'),
    timestamp: timestamp('timestamp').defaultNow(),
    title: text('title').notNull(),
    uploadToken: text('upload_token'),
    aigc: boolean('aigc').default(false),
    status: text('status'),
    description: text('description'),
    videoFile: text('video_file').notNull()
}, (table) => ({
    searchIndex: index('search_idx').using(
        'gin', 
        sql`to_tsvector('german', ${table.title} || ' ' || coalesce(${table.description}, ''))`
    )
}));

export const videoLikes = pgTable(
    'videolikes',
    {
        type: text('type').default(''),
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        video: integer('video').notNull().references(() => videos.id, { onDelete: 'cascade' })
    },
    (table) => [primaryKey({ columns: [table.user, table.video] })]
);

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    timestamp: timestamp('timestamp').defaultNow(),
    video: integer('video').notNull().references(() => videos.id, { onDelete: 'cascade' }),
    content: text('content'),
    image: text('image'),
    type: text('type').default('text'),
    pinned: boolean('pinned').default(false),
    donation: integer('donation').default(0),
    user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const commentLikes = pgTable(
    'commentlikes',
    {
        type: text('type').default('like'),
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        comment: integer('comment').notNull().references(() => comments.id, { onDelete: 'cascade' })
    },
    (table) => [primaryKey({ columns: [table.user, table.comment] })]
);

export const subscriptions = pgTable(
    'subscriptions',
    {
        user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
        channel: text('channel').notNull().references(() => user.id, { onDelete: 'cascade' })
    },
    (table) => [primaryKey({ columns: [table.user, table.channel] })]
);


export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    user: text('user').references(() => user.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').defaultNow(),
    linkTo: text('link_to'),
    description: text('description').notNull(),
    type: text('type').notNull().default('social')
});

export const logs = pgTable('logs', {
    id: serial('id').primaryKey(),
    type: text('type'),
    warning: boolean('warning').default(false),
    timestamp: timestamp('timestamp').defaultNow(),
    description: text('description')
});

export const follows = pgTable(
    'follows',
    {
        from: text('from').notNull().references(() => user.id, { onDelete: 'cascade' }),
        to: text('to').notNull().references(() => user.id, { onDelete: 'cascade' })
    },
    (table) => [primaryKey({ columns: [table.from, table.to] })]
);
