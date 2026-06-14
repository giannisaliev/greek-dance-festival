-- CreateTable
CREATE TABLE "CertificateDownload" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "downloadedById" TEXT NOT NULL,
    "downloadedByName" TEXT NOT NULL,
    "downloadedByRole" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'flyer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateDownload_participantId_idx" ON "CertificateDownload"("participantId");

-- CreateIndex
CREATE INDEX "CertificateDownload_downloadedById_idx" ON "CertificateDownload"("downloadedById");

-- CreateIndex
CREATE INDEX "CertificateDownload_createdAt_idx" ON "CertificateDownload"("createdAt");