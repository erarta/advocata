import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../application/providers/document_providers.dart';
import '../widgets/category_card.dart';

/// Main Document Templates Screen
/// Shows grid of categories + popular templates
class DocumentTemplatesScreen extends ConsumerWidget {
  const DocumentTemplatesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(documentCategoriesProvider);
    final popularAsync = ref.watch(popularTemplatesProvider(limit: 5));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Шаблоны документов'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/documents/search'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(documentCategoriesProvider);
          ref.invalidate(popularTemplatesProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Popular Templates Section
              Text(
                'Популярные',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              popularAsync.when(
                data: (templates) => templates.isEmpty
                    ? const Center(child: Text('Нет популярных шаблонов'))
                    : SizedBox(
                        height: 120,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: templates.length,
                          itemBuilder: (context, index) {
                            final template = templates[index];
                            return Card(
                              margin: const EdgeInsets.only(right: 12),
                              child: InkWell(
                                onTap: () => context.push(
                                  '/documents/${template.id}',
                                ),
                                child: Container(
                                  width: 200,
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            template.categoryIcon,
                                            style: const TextStyle(fontSize: 24),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              template.title,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const Spacer(),
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.download,
                                            size: 14,
                                            color: Colors.grey,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${template.downloadCount}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                            ),
                                          ),
                                          const Spacer(),
                                          if (template.isPremium)
                                            const Icon(
                                              Icons.lock,
                                              size: 14,
                                              color: Colors.orange,
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                loading: () => const Center(
                  child: CircularProgressIndicator(),
                ),
                error: (error, stack) => Center(
                  child: Text('Ошибка: $error'),
                ),
              ),

              const SizedBox(height: 24),

              // Categories Grid
              Text(
                'Категории',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              categoriesAsync.when(
                data: (categories) => GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    return CategoryCard(
                      category: category,
                      onTap: () => context.push(
                        '/documents/category/${category.category.value}',
                      ),
                    );
                  },
                ),
                loading: () => const Center(
                  child: CircularProgressIndicator(),
                ),
                error: (error, stack) => Center(
                  child: Text('Ошибка: $error'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
