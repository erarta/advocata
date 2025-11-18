# Document Templates Feature

## Overview

The Document Templates feature allows users to browse, search, and download legal document templates. Templates are organized by categories and can be either free (public) or premium (requires subscription).

**Status**: ✅ Implemented
**Date**: November 18, 2024
**Version**: 1.0

---

## Features

### User-Facing Features
- ✅ Browse templates by category
- ✅ View popular templates (most downloaded)
- ✅ Search templates by title, description, and tags
- ✅ Download templates to device
- ✅ Track download progress
- ✅ View document details (size, format, downloads, tags)
- ✅ Premium/Free template distinction
- ✅ Download count tracking

### Categories
1. **Договорная работа** (Contract) - Contracts and agreements
2. **Судебные решения** (Court Decision) - Court rulings
3. **Законодательство** (Law) - Laws and legal codes
4. **Нормативные акты** (Regulation) - Regulations
5. **Шаблоны документов** (Template) - Document templates
6. **Руководства** (Guide) - Legal guides
7. **Иные** (Other) - Other documents

---

## Architecture

### Backend (NestJS)

#### Domain Layer
Location: `/apps/backend/src/modules/document/`

**Document Entity** (`domain/entities/document.entity.ts`):
- Added `downloadCount` field to track popularity
- Added `incrementDownloadCount()` method

**Enums**:
- `DocumentType`: pdf, image, text
- `DocumentStatus`: pending, processing, completed, failed
- `DocumentCategory`: contract, court_decision, law, regulation, template, guide, other

#### Application Layer

**Commands**:
- `TrackDownloadCommand` - Increments download count when user downloads

**Queries**:
- `GetCategoriesQuery` - Returns all categories with document counts
- `GetPopularTemplatesQuery` - Returns most downloaded templates

#### Infrastructure Layer

**Repository** (`infrastructure/persistence/repositories/document.repository.impl.ts`):
- `getCategoryCounts(onlyPublic)` - Get counts per category
- `getPopular(limit, category?)` - Get popular templates sorted by downloadCount

**Database Migration** (`database/migrations/1732000000001-AddDownloadCountToDocuments.ts`):
- Adds `downloadCount` column (default: 0)
- Creates indexes for efficient sorting

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/templates/categories` | Get all categories with counts |
| GET | `/documents/templates/popular?limit=10&category=template` | Get popular templates |
| POST | `/documents/:id/track-download` | Increment download count |
| GET | `/documents?category=template&isPublic=true` | Get documents by category |
| GET | `/documents/:id` | Get document details |

#### Example API Responses

**GET /documents/templates/categories**:
```json
{
  "categories": [
    {
      "category": "template",
      "count": 15,
      "name": "template",
      "nameRu": "Шаблоны документов",
      "icon": "📝"
    },
    ...
  ]
}
```

**GET /documents/templates/popular**:
```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "Договор купли-продажи квартиры",
      "description": "Типовой договор...",
      "category": "contract",
      "downloadCount": 245,
      "isPublic": true,
      "fileUrl": "https://...",
      "fileSize": 245000,
      ...
    }
  ]
}
```

---

### Mobile App (Flutter)

#### Domain Layer
Location: `/apps/mobile/lib/features/documents/domain/`

**Entities**:
- `DocumentTemplateEntity` - Main document entity
- `DocumentCategoryEntity` - Category with count

**Repository Interface** (`repositories/document_repository.dart`):
- `getCategories()` - Get all categories
- `getDocumentsByCategory()` - Get documents filtered by category
- `searchDocuments()` - Search with query
- `getPopularTemplates()` - Get most downloaded
- `getDocumentById()` - Get single document
- `trackDownload()` - Track download
- `downloadDocument()` - Download file with progress

#### Data Layer
Location: `/apps/mobile/lib/features/documents/data/`

**Models**:
- `DocumentTemplateModel` - JSON model with `toEntity()` converter
- `DocumentCategoryModel` - Category JSON model

**Data Source** (`datasources/document_remote_datasource.dart`):
- API communication using Dio
- Handles all HTTP requests

**Repository Implementation** (`repositories/document_repository_impl.dart`):
- Implements domain repository interface
- Uses data source for API calls
- Handles file downloads to local storage

#### Application Layer
Location: `/apps/mobile/lib/features/documents/application/providers/`

**Riverpod Providers**:
- `documentCategoriesProvider` - All categories
- `documentsByCategoryProvider(category)` - Documents by category
- `searchDocumentsProvider(query)` - Search results
- `popularTemplatesProvider(limit, category?)` - Popular templates
- `documentDetailProvider(documentId)` - Single document
- `downloadProgressProvider(documentId)` - Download progress (0.0 - 1.0)
- `downloadDocumentProvider(...)` - Download file

#### Presentation Layer
Location: `/apps/mobile/lib/features/documents/presentation/`

**Screens**:

1. **DocumentTemplatesScreen** (`screens/document_templates_screen.dart`)
   - Shows popular templates (horizontal scroll)
   - Shows categories grid (2 columns)
   - Pull-to-refresh support
   - Search button in app bar

2. **DocumentDetailScreen** (`screens/document_detail_screen.dart`)
   - Document icon/preview
   - Title and description
   - Metadata (format, size, downloads, type)
   - Tags display
   - Download button with progress
   - Share button (TODO)

**Widgets**:

1. **CategoryCard** (`widgets/category_card.dart`)
   - Category icon (emoji)
   - Category name (Russian)
   - Document count

2. **DownloadButton** (`widgets/download_button.dart`)
   - Handles download logic
   - Shows progress during download
   - Premium check (shows paywall if needed)
   - Success/error handling
   - Opens file after download

---

## Database Schema

### documents table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| lawyerId | uuid | Document owner |
| title | varchar(200) | Document title |
| description | text | Optional description |
| fileName | varchar(255) | Original file name |
| fileUrl | text | Full URL to file |
| fileSize | bigint | Size in bytes |
| mimeType | varchar(100) | MIME type |
| type | enum | pdf, image, text |
| category | enum | contract, court_decision, law, etc. |
| status | enum | pending, processing, completed, failed |
| isPublic | boolean | True = free, False = premium |
| tags | text | Comma-separated tags |
| metadata | jsonb | Additional metadata |
| **downloadCount** | int | **Download counter (new)** |
| processedAt | timestamp | Processing completion time |
| errorMessage | text | Error if failed |
| chunkCount | int | Number of chunks for RAG |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update time |

**Indexes**:
- `IDX_DOCUMENTS_DOWNLOAD_COUNT` on `downloadCount` DESC
- `IDX_DOCUMENTS_PUBLIC_DOWNLOAD_COUNT` on (`isPublic`, `downloadCount` DESC) WHERE `isPublic` = true
- Existing indexes on lawyerId, category, status, etc.

---

## Data Flow

### 1. Loading Categories

```
User opens screen
    → categoriesProvider triggered
    → documentRepository.getCategories()
    → remoteDataSource.getCategories()
    → GET /documents/templates/categories
    → Backend: GetCategoriesHandler
    → Repository.getCategoryCounts(onlyPublic=true)
    → SQL GROUP BY category with COUNT
    → Returns categories with counts
    → Model → Entity conversion
    → UI displays category grid
```

### 2. Downloading a Document

```
User taps "Download" button
    → DownloadButton checks if premium
    → (if premium) Check subscription → Show paywall
    → downloadDocumentProvider triggered
    → downloadDocument(id, fileName, fileUrl)
    → dio.download() with progress callback
    → onProgress updates downloadProgressProvider
    → UI shows progress bar
    → File saved to /downloads folder
    → trackDownload() called
    → POST /documents/:id/track-download
    → Backend: TrackDownloadHandler
    → document.incrementDownloadCount()
    → Repository saves document
    → Returns filePath
    → UI shows success + "Open" button
    → open_file package opens file
```

---

## Code Generation

The mobile app uses **freezed** and **json_serializable** for code generation.

Run this command to generate necessary files:

```bash
cd apps/mobile
flutter pub run build_runner build --delete-conflicting-outputs
```

This will generate:
- `*.freezed.dart` - Freezed models
- `*.g.dart` - JSON serialization
- `*.g.dart` - Riverpod providers

---

## Dependencies

### Backend
- `@nestjs/cqrs` - CQRS pattern
- `typeorm` - Database ORM
- `@nestjs/swagger` - API documentation

### Mobile
- `flutter_riverpod` - State management
- `freezed` - Immutable models
- `json_annotation` - JSON serialization
- `dio` - HTTP client
- `path_provider` - File system access
- `open_file` - Open files with default app
- `go_router` - Navigation

---

## Testing

### Backend Tests

**Unit Tests** (`test/unit/document/`):
- Document entity download count increment
- TrackDownload command handler
- GetCategories query handler
- GetPopularTemplates query handler

**Integration Tests** (`test/integration/document/`):
- Repository methods (getCategoryCounts, getPopular)
- API endpoints

**E2E Tests** (`test/e2e/document/`):
- Full download flow
- Category browsing flow

**Run tests**:
```bash
cd apps/backend
npm run test
npm run test:e2e
```

### Mobile Tests

**Unit Tests** (`test/features/documents/domain/`):
- Entity methods (isPremium, fileSizeFormatted)
- Repository implementation

**Widget Tests** (`test/features/documents/presentation/`):
- CategoryCard rendering
- DownloadButton states
- Screen layouts

**Integration Tests** (`test/features/documents/integration/`):
- Full download flow
- Category navigation flow

**Run tests**:
```bash
cd apps/mobile
flutter test
flutter test --coverage
```

---

## Future Enhancements

### Phase 2 (Future)
- [ ] Offline access to downloaded documents
- [ ] Favorites/bookmarks
- [ ] Recent downloads history
- [ ] Document preview (PDF viewer)
- [ ] Advanced filters (date range, file type, size)
- [ ] Document ratings and reviews
- [ ] Share templates with other users
- [ ] Custom template upload (for lawyers)
- [ ] Document versioning
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI-powered document recommendations
- [ ] Document comparison tool
- [ ] Fill-in-the-blank templates with guided wizard
- [ ] E-signature integration
- [ ] Document collaboration features

---

## Known Issues

1. **Open File Support**: `open_file` package may not work on all Android versions
   - **Fix**: Add fallback to share file if open fails

2. **Large File Downloads**: No pause/resume support
   - **Fix**: Add download queue with pause/resume functionality

3. **Subscription Check**: Premium check is TODO
   - **Fix**: Integrate with Payment module subscription status

---

## How to Use

### For Developers

1. **Run database migration**:
   ```bash
   cd apps/backend
   npm run migration:run
   ```

2. **Seed documents** (optional):
   ```bash
   npm run seed:documents
   ```

3. **Generate Flutter code**:
   ```bash
   cd apps/mobile
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Start backend**:
   ```bash
   cd apps/backend
   npm run start:dev
   ```

5. **Run mobile app**:
   ```bash
   cd apps/mobile
   flutter run
   ```

### For Users

1. Open the app
2. Navigate to "Шаблоны" from home screen
3. Browse categories or popular templates
4. Tap on a category to see documents
5. Tap on a document to view details
6. Tap "Скачать документ" to download
7. After download, tap "Открыть" to open the file

---

## API Documentation

Full API documentation available via Swagger:
- **Local**: http://localhost:3000/api
- **Staging**: https://staging.advocata.ru/api

Relevant endpoints are under the **documents** tag.

---

## Support & Contact

For issues or questions:
- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Repository**: https://github.com/erarta/advocata

---

**Last Updated**: November 18, 2024
**Author**: Claude AI Assistant
**Version**: 1.0
