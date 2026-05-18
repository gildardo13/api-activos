/*
  Warnings:

  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendanceLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLogTransactionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BiometricData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CostCenters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DayNomina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DaysPerYearPersonal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DaysPerYearVacations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentApprovals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentPackages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmergencyContacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeTermination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmploymentDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IdCardHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Incidents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentsSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Level` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModuleSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nomina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NominaConcept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NominaCostCenters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NominaDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Office` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonalDays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionDocumentsRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionPackageRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffBankData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffBeneficiaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffDataPrivate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffDocumentsDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffDocumentsRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffFiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffNomina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subarea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeRecorderStaffReference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VacationPolicies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payerOrganizationRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_type_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_costCenterId_fkey";

-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_managerId_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceLogs" DROP CONSTRAINT "AttendanceLogs_staffId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_transactionGroupId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLogTransactionGroup" DROP CONSTRAINT "AuditLogTransactionGroup_staffId_fkey";

-- DropForeignKey
ALTER TABLE "BankDetails" DROP CONSTRAINT "BankDetails_payerId_fkey";

-- DropForeignKey
ALTER TABLE "BiometricData" DROP CONSTRAINT "BiometricData_TimeRecorderStaffReferenceId_fkey";

-- DropForeignKey
ALTER TABLE "DayNomina" DROP CONSTRAINT "DayNomina_nominaDetailId_fkey";

-- DropForeignKey
ALTER TABLE "DaysPerYearPersonal" DROP CONSTRAINT "DaysPerYearPersonal_personalDaysId_fkey";

-- DropForeignKey
ALTER TABLE "DaysPerYearVacations" DROP CONSTRAINT "DaysPerYearVacations_vacationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackages" DROP CONSTRAINT "DocumentPackages_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackages" DROP CONSTRAINT "DocumentPackages_packageId_fkey";

-- DropForeignKey
ALTER TABLE "EmergencyContacts" DROP CONSTRAINT "EmergencyContacts_staffId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeTermination" DROP CONSTRAINT "EmployeeTermination_staffId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeTermination" DROP CONSTRAINT "EmployeeTermination_terminatedBy_fkey";

-- DropForeignKey
ALTER TABLE "EmploymentDetails" DROP CONSTRAINT "EmploymentDetails_staffId_fkey";

-- DropForeignKey
ALTER TABLE "IdCardHistory" DROP CONSTRAINT "IdCardHistory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "IdCardHistory" DROP CONSTRAINT "IdCardHistory_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Incidents" DROP CONSTRAINT "Incidents_dayNominaId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentsSettings" DROP CONSTRAINT "IncidentsSettings_incidentCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "NominaCostCenters" DROP CONSTRAINT "NominaCostCenters_costCenterId_fkey";

-- DropForeignKey
ALTER TABLE "NominaCostCenters" DROP CONSTRAINT "NominaCostCenters_nominaId_fkey";

-- DropForeignKey
ALTER TABLE "NominaDetail" DROP CONSTRAINT "NominaDetail_nominaId_fkey";

-- DropForeignKey
ALTER TABLE "NominaDetail" DROP CONSTRAINT "NominaDetail_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_reportsToId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_subareaId_fkey";

-- DropForeignKey
ALTER TABLE "PositionDocumentsRelation" DROP CONSTRAINT "PositionDocumentsRelation_documentId_fkey";

-- DropForeignKey
ALTER TABLE "PositionDocumentsRelation" DROP CONSTRAINT "PositionDocumentsRelation_positionId_fkey";

-- DropForeignKey
ALTER TABLE "PositionPackageRelation" DROP CONSTRAINT "PositionPackageRelation_packageId_fkey";

-- DropForeignKey
ALTER TABLE "PositionPackageRelation" DROP CONSTRAINT "PositionPackageRelation_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_officeId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_personalDaysId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_reportsToStaff_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_vacationPolicieId_fkey";

-- DropForeignKey
ALTER TABLE "StaffAddress" DROP CONSTRAINT "StaffAddress_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffBankData" DROP CONSTRAINT "StaffBankData_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffBeneficiaries" DROP CONSTRAINT "StaffBeneficiaries_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDataPrivate" DROP CONSTRAINT "StaffDataPrivate_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDocumentsDetails" DROP CONSTRAINT "StaffDocumentsDetails_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDocumentsDetails" DROP CONSTRAINT "StaffDocumentsDetails_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDocumentsRelation" DROP CONSTRAINT "StaffDocumentsRelation_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDocumentsRelation" DROP CONSTRAINT "StaffDocumentsRelation_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffFiles" DROP CONSTRAINT "StaffFiles_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffNomina" DROP CONSTRAINT "StaffNomina_payerComplementaryId_fkey";

-- DropForeignKey
ALTER TABLE "StaffNomina" DROP CONSTRAINT "StaffNomina_payerFiscalId_fkey";

-- DropForeignKey
ALTER TABLE "StaffNomina" DROP CONSTRAINT "StaffNomina_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_costCenterId_fkey";

-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_parentSubareaId_fkey";

-- DropForeignKey
ALTER TABLE "TaxData" DROP CONSTRAINT "TaxData_payerId_fkey";

-- DropForeignKey
ALTER TABLE "TimeRecorderStaffReference" DROP CONSTRAINT "TimeRecorderStaffReference_staffId_fkey";

-- DropForeignKey
ALTER TABLE "payerOrganizationRelation" DROP CONSTRAINT "payerOrganizationRelation_payerId_fkey";

-- DropForeignKey
ALTER TABLE "request_type_assignments" DROP CONSTRAINT "request_type_assignments_area_id_fkey";

-- DropForeignKey
ALTER TABLE "request_type_assignments" DROP CONSTRAINT "request_type_assignments_request_type_id_fkey";

-- DropForeignKey
ALTER TABLE "request_type_assignments" DROP CONSTRAINT "request_type_assignments_subarea_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_request_type_id_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_staff_id_fkey";

-- DropTable
DROP TABLE "Action";

-- DropTable
DROP TABLE "Area";

-- DropTable
DROP TABLE "AttendanceLogs";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "AuditLogTransactionGroup";

-- DropTable
DROP TABLE "BankDetails";

-- DropTable
DROP TABLE "BiometricData";

-- DropTable
DROP TABLE "CostCenters";

-- DropTable
DROP TABLE "DayNomina";

-- DropTable
DROP TABLE "DaysPerYearPersonal";

-- DropTable
DROP TABLE "DaysPerYearVacations";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentApprovals";

-- DropTable
DROP TABLE "DocumentPackages";

-- DropTable
DROP TABLE "EmergencyContacts";

-- DropTable
DROP TABLE "EmployeeTermination";

-- DropTable
DROP TABLE "EmploymentDetails";

-- DropTable
DROP TABLE "FieldRequirement";

-- DropTable
DROP TABLE "IdCardHistory";

-- DropTable
DROP TABLE "IncidentCategories";

-- DropTable
DROP TABLE "Incidents";

-- DropTable
DROP TABLE "IncidentsSettings";

-- DropTable
DROP TABLE "Level";

-- DropTable
DROP TABLE "ModuleSettings";

-- DropTable
DROP TABLE "Nomina";

-- DropTable
DROP TABLE "NominaConcept";

-- DropTable
DROP TABLE "NominaCostCenters";

-- DropTable
DROP TABLE "NominaDetail";

-- DropTable
DROP TABLE "NotificationLog";

-- DropTable
DROP TABLE "Office";

-- DropTable
DROP TABLE "Package";

-- DropTable
DROP TABLE "Payer";

-- DropTable
DROP TABLE "PersonalDays";

-- DropTable
DROP TABLE "Position";

-- DropTable
DROP TABLE "PositionDocumentsRelation";

-- DropTable
DROP TABLE "PositionPackageRelation";

-- DropTable
DROP TABLE "Rule";

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "StaffAddress";

-- DropTable
DROP TABLE "StaffBankData";

-- DropTable
DROP TABLE "StaffBeneficiaries";

-- DropTable
DROP TABLE "StaffDataPrivate";

-- DropTable
DROP TABLE "StaffDocumentsDetails";

-- DropTable
DROP TABLE "StaffDocumentsRelation";

-- DropTable
DROP TABLE "StaffFiles";

-- DropTable
DROP TABLE "StaffNomina";

-- DropTable
DROP TABLE "Subarea";

-- DropTable
DROP TABLE "TaxData";

-- DropTable
DROP TABLE "TimeRecorderStaffReference";

-- DropTable
DROP TABLE "VacationPolicies";

-- DropTable
DROP TABLE "payerOrganizationRelation";

-- DropTable
DROP TABLE "request_type_assignments";

-- DropTable
DROP TABLE "request_types";

-- DropTable
DROP TABLE "requests";

-- DropEnum
DROP TYPE "AttendanceType";

-- DropEnum
DROP TYPE "BankAccountStatus";

-- DropEnum
DROP TYPE "BiometricStatus";

-- DropEnum
DROP TYPE "BiometricType";

-- DropEnum
DROP TYPE "ContractDuration";

-- DropEnum
DROP TYPE "ContractType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PayerOrganizationStatus";

-- DropEnum
DROP TYPE "PayerStatus";

-- DropEnum
DROP TYPE "PayerType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PositionStatus";

-- DropEnum
DROP TYPE "RequestDates";

-- DropEnum
DROP TYPE "RequestDatesDetails";

-- DropEnum
DROP TYPE "RequestStatus";

-- DropEnum
DROP TYPE "RequestTypeDatePeriod";

-- DropEnum
DROP TYPE "RequestTypeDateType";

-- DropEnum
DROP TYPE "TimeRecorderStaffReferenceStatus";

-- DropEnum
DROP TYPE "WhoCanApply";

-- CreateTable
CREATE TABLE "AssetType" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "lastLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetTelemetryLog" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "latitud" TEXT NOT NULL,
    "longitud" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetTelemetryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetFieldDefinition" (
    "id" TEXT NOT NULL,
    "assetTypeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDocument" (
    "id" TEXT NOT NULL,
    "fieldDefinitionId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetGeofence" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetGeofence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDocumentChunk" (
    "id" TEXT NOT NULL,
    "assetDocumentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JibbyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JibbyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RhStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RhStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RhArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RhArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetType_categoryId_idx" ON "AssetType"("categoryId");

-- CreateIndex
CREATE INDEX "Asset_assetTypeId_idx" ON "Asset"("assetTypeId");

-- CreateIndex
CREATE INDEX "AssetTelemetryLog_assetId_idx" ON "AssetTelemetryLog"("assetId");

-- CreateIndex
CREATE INDEX "AssetFieldDefinition_assetTypeId_idx" ON "AssetFieldDefinition"("assetTypeId");

-- CreateIndex
CREATE INDEX "AssetDocument_fieldDefinitionId_idx" ON "AssetDocument"("fieldDefinitionId");

-- CreateIndex
CREATE INDEX "AssetDocument_assetId_idx" ON "AssetDocument"("assetId");

-- CreateIndex
CREATE INDEX "AssetGeofence_assetId_idx" ON "AssetGeofence"("assetId");

-- CreateIndex
CREATE INDEX "AssetDocumentChunk_assetDocumentId_idx" ON "AssetDocumentChunk"("assetDocumentId");

-- CreateIndex
CREATE INDEX "AssetAssignment_assetId_idx" ON "AssetAssignment"("assetId");

-- CreateIndex
CREATE INDEX "AssetAssignment_projectId_idx" ON "AssetAssignment"("projectId");

-- CreateIndex
CREATE INDEX "AssetAssignment_staffId_idx" ON "AssetAssignment"("staffId");

-- CreateIndex
CREATE INDEX "AssetAssignment_areaId_idx" ON "AssetAssignment"("areaId");

-- AddForeignKey
ALTER TABLE "AssetType" ADD CONSTRAINT "AssetType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JibbyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTelemetryLog" ADD CONSTRAINT "AssetTelemetryLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFieldDefinition" ADD CONSTRAINT "AssetFieldDefinition_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDocument" ADD CONSTRAINT "AssetDocument_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDocument" ADD CONSTRAINT "AssetDocument_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES "AssetFieldDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetGeofence" ADD CONSTRAINT "AssetGeofence_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDocumentChunk" ADD CONSTRAINT "AssetDocumentChunk_assetDocumentId_fkey" FOREIGN KEY ("assetDocumentId") REFERENCES "AssetDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "RhStaff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RhArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
