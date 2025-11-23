import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:open_file/open_file.dart';
import '../../application/providers/document_providers.dart';
import '../widgets/download_button.dart';

/// Document Detail Screen
/// Shows document details with download button
class DocumentDetailScreen extends ConsumerWidget {
  final String documentId;

  const DocumentDetailScreen({
    Key? key,
    required this.documentId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final documentAsync = ref.watch(documentDetailProvider(documentId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Документ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
            },
          ),
        ],
      ),
      body: documentAsync.when(
        data: (document) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Document icon/preview
              Center(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      document.categoryIcon,
                      style: const TextStyle(fontSize: 60),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                document.title,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),

              // Category badge
              Chip(
                label: Text(document.categoryNameRu),
                avatar: Text(document.categoryIcon),
              ),
              const SizedBox(height: 16),

              // Description
              if (document.description != null) ...[
                Text(
                  'Описание',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(document.description!),
                const SizedBox(height: 16),
              ],

              // Metadata
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildMetadataRow(
                        context,
                        'Формат',
                        document.fileExtension.toUpperCase(),
                        Icons.description,
                      ),
                      const Divider(),
                      _buildMetadataRow(
                        context,
                        'Размер',
                        document.fileSizeFormatted,
                        Icons.storage,
                      ),
                      const Divider(),
                      _buildMetadataRow(
                        context,
                        'Скачано',
                        '${document.downloadCount} раз',
                        Icons.download,
                      ),
                      const Divider(),
                      _buildMetadataRow(
                        context,
                        'Тип',
                        document.isFree ? 'Бесплатный' : 'Premium',
                        document.isFree ? Icons.check_circle : Icons.lock,
                        color: document.isFree ? Colors.green : Colors.orange,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Tags
              if (document.tags.isNotEmpty) ...[
                Text(
                  'Теги',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: document.tags.map((tag) {
                    return Chip(
                      label: Text('#$tag'),
                      labelStyle: const TextStyle(fontSize: 12),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
              ],

              // Download button
              const SizedBox(height: 24),
              DownloadButton(
                document: document,
                onDownloadComplete: (filePath) async {
                  // Show success message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Документ успешно скачан'),
                      action: SnackBarAction(
                        label: 'Открыть',
                        onPressed: () async {
                          await OpenFile.open(filePath);
                        },
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Ошибка: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(documentDetailProvider(documentId));
                },
                child: const Text('Повторить'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetadataRow(
    BuildContext context,
    String label,
    String value,
    IconData icon, {
    Color? color,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: color ?? Colors.grey[600]),
        const SizedBox(width: 12),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}
