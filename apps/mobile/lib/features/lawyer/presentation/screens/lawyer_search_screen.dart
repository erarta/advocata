import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../../domain/entities/lawyer_entity.dart';
import '../providers/lawyer_search_notifier.dart';
import '../providers/lawyer_search_state.dart';
import '../widgets/lawyer_card.dart';

/// Lawyer search screen
class LawyerSearchScreen extends ConsumerStatefulWidget {
  const LawyerSearchScreen({super.key});

  @override
  ConsumerState<LawyerSearchScreen> createState() =>
      _LawyerSearchScreenState();
}

class _LawyerSearchScreenState extends ConsumerState<LawyerSearchScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Load lawyers on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(lawyerSearchNotifierProvider.notifier).search();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(lawyerSearchNotifierProvider);
    final filters = ref.watch(lawyerSearchNotifierProvider.notifier).filters;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Поиск юристов',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () => _showFiltersBottomSheet(context, filters),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomTextField(
              controller: _searchController,
              hint: 'Поиск по специализации...',
              prefixIcon: const Icon(Icons.search_rounded),
              onChanged: (value) {
                // TODO: Implement text search
              },
            ),
          ),

          // Filters chips
          if (filters.hasFilters) _buildActiveFilters(filters),

          // Results
          Expanded(
            child: _buildBody(searchState),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveFilters(LawyerSearchFilters filters) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          // Specializations
          ...filters.specializations.map((spec) {
            final displayName = SpecializationType.fromKey(spec).displayName;
            return _buildFilterChip(
              label: displayName,
              onDeleted: () {
                ref
                    .read(lawyerSearchNotifierProvider.notifier)
                    .removeSpecialization(spec);
              },
            );
          }),

          // Rating
          if (filters.minRating != null)
            _buildFilterChip(
              label: 'Рейтинг ${filters.minRating}+',
              onDeleted: () {
                ref
                    .read(lawyerSearchNotifierProvider.notifier)
                    .setMinRating(null);
              },
            ),

          // Experience
          if (filters.minExperience != null)
            _buildFilterChip(
              label: 'Опыт ${filters.minExperience}+ лет',
              onDeleted: () {
                ref
                    .read(lawyerSearchNotifierProvider.notifier)
                    .setMinExperience(null);
              },
            ),

          // Availability
          if (filters.isAvailable != null)
            _buildFilterChip(
              label: 'Только доступные',
              onDeleted: () {
                ref
                    .read(lawyerSearchNotifierProvider.notifier)
                    .setAvailability(null);
              },
            ),

          // Clear all
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: TextButton(
              onPressed: () {
                ref
                    .read(lawyerSearchNotifierProvider.notifier)
                    .clearFilters();
              },
              child: const Text('Очистить все'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required VoidCallback onDeleted,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Chip(
        label: Text(label),
        deleteIcon: const Icon(Icons.close_rounded, size: 18),
        onDeleted: onDeleted,
        backgroundColor: AppColors.primaryLight.withOpacity(0.2),
        labelStyle: AppTextStyles.bodySmall.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildBody(LawyerSearchState state) {
    return state.when(
      initial: () => const Center(
        child: Text('Начните поиск юристов'),
      ),
      loading: () => const LoadingIndicator(),
      loaded: (lawyers) => _buildLawyersList(lawyers),
      empty: () => EmptyState(
        icon: Icons.search_off_rounded,
        title: 'Юристы не найдены',
        subtitle: 'Попробуйте изменить фильтры поиска',
        actionLabel: 'Очистить фильтры',
        onAction: () {
          ref.read(lawyerSearchNotifierProvider.notifier).clearFilters();
        },
      ),
      error: (message) => ErrorState(
        message: message,
        onRetry: () {
          ref.read(lawyerSearchNotifierProvider.notifier).search();
        },
      ),
    );
  }

  Widget _buildLawyersList(List<LawyerEntity> lawyers) {
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(lawyerSearchNotifierProvider.notifier).search();
      },
      child: ListView.separated(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: lawyers.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final lawyer = lawyers[index];
          return LawyerCard(
            lawyer: lawyer,
            onTap: () {
              context.pushNamed('lawyer-detail', pathParameters: {
                'id': lawyer.id,
              });
            },
          );
        },
      ),
    );
  }

  void _showFiltersBottomSheet(
    BuildContext context,
    LawyerSearchFilters currentFilters,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _FiltersBottomSheet(
        currentFilters: currentFilters,
        onApply: (filters) {
          ref
              .read(lawyerSearchNotifierProvider.notifier)
              .updateFilters(filters);
          Navigator.pop(context);
        },
      ),
    );
  }
}

/// Filters bottom sheet
class _FiltersBottomSheet extends StatefulWidget {
  final LawyerSearchFilters currentFilters;
  final Function(LawyerSearchFilters) onApply;

  const _FiltersBottomSheet({
    required this.currentFilters,
    required this.onApply,
  });

  @override
  State<_FiltersBottomSheet> createState() => _FiltersBottomSheetState();
}

class _FiltersBottomSheetState extends State<_FiltersBottomSheet> {
  late List<String> _selectedSpecializations;
  late double? _minRating;
  late int? _minExperience;
  late bool? _isAvailable;

  @override
  void initState() {
    super.initState();
    _selectedSpecializations =
        List.from(widget.currentFilters.specializations);
    _minRating = widget.currentFilters.minRating;
    _minExperience = widget.currentFilters.minExperience;
    _isAvailable = widget.currentFilters.isAvailable;
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.grey300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Text(
                    'Фильтры',
                    style: AppTextStyles.headingLarge,
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _selectedSpecializations = [];
                        _minRating = null;
                        _minExperience = null;
                        _isAvailable = null;
                      });
                    },
                    child: const Text('Сбросить'),
                  ),
                ],
              ),
            ),

            const Divider(),

            // Content
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                children: [
                  // Specializations
                  Text(
                    'Специализация',
                    style: AppTextStyles.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: SpecializationType.values.map((type) {
                      final isSelected =
                          _selectedSpecializations.contains(type.key);
                      return FilterChip(
                        label: Text(type.displayName),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            if (selected) {
                              _selectedSpecializations.add(type.key);
                            } else {
                              _selectedSpecializations.remove(type.key);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // Rating
                  Text(
                    'Минимальный рейтинг',
                    style: AppTextStyles.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Slider(
                    value: _minRating ?? 0,
                    min: 0,
                    max: 5,
                    divisions: 10,
                    label: _minRating?.toStringAsFixed(1) ?? 'Любой',
                    onChanged: (value) {
                      setState(() {
                        _minRating = value > 0 ? value : null;
                      });
                    },
                  ),

                  const SizedBox(height: 24),

                  // Experience
                  Text(
                    'Минимальный опыт (лет)',
                    style: AppTextStyles.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [0, 3, 5, 10].map((years) {
                      final isSelected = _minExperience == years;
                      return FilterChip(
                        label: Text(years == 0 ? 'Любой' : '$years+'),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            _minExperience = selected && years > 0 ? years : null;
                          });
                        },
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // Availability
                  CheckboxListTile(
                    value: _isAvailable ?? false,
                    onChanged: (value) {
                      setState(() {
                        _isAvailable = value == true ? true : null;
                      });
                    },
                    title: const Text('Только доступные сейчас'),
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),

            // Apply button
            Padding(
              padding: const EdgeInsets.all(16),
              child: PrimaryButton(
                text: 'Применить фильтры',
                onPressed: () {
                  widget.onApply(LawyerSearchFilters(
                    specializations: _selectedSpecializations,
                    minRating: _minRating,
                    minExperience: _minExperience,
                    isAvailable: _isAvailable,
                  ));
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
