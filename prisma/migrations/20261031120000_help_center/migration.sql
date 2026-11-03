-- CreateEnum
CREATE TYPE "HelpAudience" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "HelpCategory" (
    "id" TEXT NOT NULL,
    "audience" "HelpAudience" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpArticle" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contextRoutes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedRoles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "appVersion" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpArticleRevision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "editorId" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpArticleRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpFaq" (
    "id" TEXT NOT NULL,
    "audience" "HelpAudience" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpCategory_audience_sortOrder_idx" ON "HelpCategory"("audience", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_audience_slug_key" ON "HelpCategory"("audience", "slug");

-- CreateIndex
CREATE INDEX "HelpArticle_published_updatedAt_idx" ON "HelpArticle"("published", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HelpArticle_categoryId_slug_key" ON "HelpArticle"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "HelpArticleRevision_articleId_createdAt_idx" ON "HelpArticleRevision"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "HelpFaq_audience_published_sortOrder_idx" ON "HelpFaq"("audience", "published", "sortOrder");

-- AddForeignKey
ALTER TABLE "HelpArticle" ADD CONSTRAINT "HelpArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HelpCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpArticleRevision" ADD CONSTRAINT "HelpArticleRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "HelpArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpArticleRevision" ADD CONSTRAINT "HelpArticleRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFaq" ADD CONSTRAINT "HelpFaq_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "HelpArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
