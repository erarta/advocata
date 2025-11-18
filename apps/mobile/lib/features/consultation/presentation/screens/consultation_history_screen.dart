import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_state.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_notifier.dart';
import 'package:advocata/features/consultation/presentation/widgets/consultation_card.dart';
import 'package:advocata/features/consultation/presentation/widgets/rate_consultation_dialog.dart';
import 'package:advocata/core/presentation/widgets/common/loading_indicator.dart';
import 'package:advocata/core/presentation/widgets/common/empty_state.dart';
import 'package:advocata/core/presentation/widgets/common/error_state.dart';

/// Screen showing user's consultation history
class ConsultationHistoryScreen extends ConsumerStatefulWidget {
  const ConsultationHistoryScreen({super.key});

  @override
  ConsumerState<ConsultationHistoryScreen> createState() =>
      _ConsultationHistoryScreenState();
}

class _ConsultationHistoryScreenState
    extends ConsumerState<ConsultationHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);

    // Load consultations on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(consultationListNotifierProvider.notifier).loadConsultations();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(consultationListNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Мои консультации'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Все'),
            Tab(text: 'Активные'),
            Tab(text: 'Завершенные'),
            Tab(text: 'Отмененные'),
          ],
          onTap: (index) => _onTabChanged(index),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _onRefresh(),
        child: state.when(
          initial: () => const Center(child: Text('Загрузка...')),
          loading: () => const Center(child: LoadingIndicator()),
          loaded: (consultations) =>
              _buildConsultationList(consultations, _getSelectedStatus()),
          error: (message) => ErrorState(
            message: message,
            onRetry: () => _onRefresh(),
          ),
        ),
      ),
    );
  }

  /// Build consultation list
  Widget _buildConsultationList(
    List<ConsultationEntity> allConsultations,
    String? statusFilter,
  ) {
    // Filter consultations by status
    final filteredConsultations = statusFilter == null
        ? allConsultations
        : allConsultations.where((c) {
            switch (statusFilter) {
              case 'active':
                return c.status == ConsultationStatus.pending ||
                    c.status == ConsultationStatus.confirmed ||
                    c.status == ConsultationStatus.active;
              case 'completed':
                return c.status == ConsultationStatus.completed;
              case 'cancelled':
                return c.status == ConsultationStatus.cancelled ||
                    c.status == ConsultationStatus.failed ||
                    c.status == ConsultationStatus.expired;
              default:
                return true;
            }
          }).toList();

    if (filteredConsultations.isEmpty) {
      return EmptyState(
        icon: Icons.event_busy_rounded,
        title: 'Нет консультаций',
        message: _getEmptyMessage(statusFilter),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: filteredConsultations.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final consultation = filteredConsultations[index];
        return ConsultationCard(
          consultation: consultation,
          onTap: () => _onConsultationTap(consultation),
          onRate: consultation.status == 'completed' && consultation.rating == null
              ? () => _showRatingDialog(consultation)
              : null,
          onChat: (consultation.status == 'active' ||
                  consultation.status == 'confirmed' ||
                  consultation.status == 'completed')
              ? () => _openChat(consultation)
              : null,
        );
      },
    );
  }

  /// Get empty message based on filter
  String _getEmptyMessage(String? statusFilter) {
    switch (statusFilter) {
      case 'active':
        return 'У вас нет активных консультаций';
      case 'completed':
        return 'У вас нет завершенных консультаций';
      case 'cancelled':
        return 'У вас нет отмененных консультаций';
      default:
        return 'Вы еще не забронировали ни одной консультации';
    }
  }

  /// Get selected status filter based on tab index
  String? _getSelectedStatus() {
    switch (_tabController.index) {
      case 0:
        return null; // All
      case 1:
        return 'active';
      case 2:
        return 'completed';
      case 3:
        return 'cancelled';
      default:
        return null;
    }
  }

  /// Handle tab change
  void _onTabChanged(int index) {
    final status = _getSelectedStatus();
    ref.read(consultationListNotifierProvider.notifier).loadConsultations(
          status: status,
        );
  }

  /// Handle refresh
  Future<void> _onRefresh() async {
    final status = _getSelectedStatus();
    await ref.read(consultationListNotifierProvider.notifier).refresh(
          status: status,
        );
  }

  /// Handle consultation tap
  void _onConsultationTap(ConsultationEntity consultation) {
    context.push('/consultations/${consultation.id}');
  }

  /// Show rating dialog
  void _showRatingDialog(ConsultationEntity consultation) {
    showDialog(
      context: context,
      builder: (context) => RateConsultationDialog(
        consultationId: consultation.id,
        lawyerName: 'Юрист', // TODO: Get lawyer name from consultation
      ),
    ).then((rated) {
      if (rated == true) {
        // Refresh list after rating
        _onRefresh();
      }
    });
  }

  /// Open chat for consultation
  void _openChat(ConsultationEntity consultation) {
    context.push(
      '/consultations/${consultation.id}/chat',
      extra: {
        'consultationId': consultation.id,
        'lawyerName': 'Юрист', // TODO: Get lawyer name from consultation
        'lawyerAvatar': null, // TODO: Get lawyer avatar from consultation
      },
    );
  }
}
