# Document Templates - Router Integration Guide

## Routes to Add

Add these routes to `/apps/mobile/lib/config/router_config.dart`:

```dart
import '../features/documents/presentation/screens/document_templates_screen.dart';
import '../features/documents/presentation/screens/document_detail_screen.dart';

// In your GoRouter routes list, add:

GoRoute(
  path: '/documents/templates',
  name: 'document-templates',
  builder: (context, state) => const DocumentTemplatesScreen(),
),

GoRoute(
  path: '/documents/:id',
  name: 'document-detail',
  builder: (context, state) {
    final documentId = state.pathParameters['id']!;
    return DocumentDetailScreen(documentId: documentId);
  },
),

GoRoute(
  path: '/documents/category/:category',
  name: 'documents-by-category',
  builder: (context, state) {
    final category = state.pathParameters['category']!;
    // TODO: Create DocumentCategoryScreen
    // return DocumentCategoryScreen(category: category);
    return const Placeholder(); // Temporary
  },
),

GoRoute(
  path: '/documents/search',
  name: 'document-search',
  builder: (context, state) {
    // TODO: Create DocumentSearchScreen
    // return const DocumentSearchScreen();
    return const Placeholder(); // Temporary
  },
),
```

## Home Screen Integration

Add a button/card on the home screen to navigate to templates:

```dart
// In your home screen:

Card(
  child: ListTile(
    leading: const Icon(Icons.description),
    title: const Text('Шаблоны документов'),
    subtitle: const Text('Скачайте готовые юридические документы'),
    trailing: const Icon(Icons.arrow_forward_ios),
    onTap: () => context.push('/documents/templates'),
  ),
)
```

## Deep Linking (Optional)

To support deep links like `advocata://documents/123`:

1. Update `AndroidManifest.xml`:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="advocata" android:host="documents" />
</intent-filter>
```

2. Update `Info.plist` for iOS

3. Handle in router:
```dart
GoRouter(
  initialLocation: '/documents/templates', // or parse from deep link
  // ...
)
```

## Navigation Examples

```dart
// Navigate to templates screen
context.push('/documents/templates');

// Navigate to specific document
context.push('/documents/$documentId');

// Navigate to category
context.push('/documents/category/template');

// Navigate to search
context.push('/documents/search');

// Go back
context.pop();
```

## Additional Screens to Create

For a complete feature, create these additional screens:

### 1. DocumentCategoryScreen
Shows list of documents in a category.

### 2. DocumentSearchScreen
Search functionality with filters.

These are referenced in the router but not implemented yet. Use the existing screens as templates.
