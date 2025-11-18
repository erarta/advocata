import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_state.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_notifier.dart';
import 'package:advocata/core/presentation/widgets/buttons/primary_button.dart';
import 'package:advocata/core/presentation/widgets/inputs/custom_text_field.dart';

/// Screen for booking a consultation
class BookConsultationScreen extends ConsumerStatefulWidget {
  final String lawyerId;
  final String lawyerName;

  const BookConsultationScreen({
    super.key,
    required this.lawyerId,
    required this.lawyerName,
  });

  @override
  ConsumerState<BookConsultationScreen> createState() =>
      _BookConsultationScreenState();
}

class _BookConsultationScreenState
    extends ConsumerState<BookConsultationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();

  ConsultationType _selectedType = ConsultationType.scheduled;
  DateTime? _selectedStartTime;
  DateTime? _selectedEndTime;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<BookingState>(bookingNotifierProvider, (previous, state) {
      state.whenOrNull(
        success: (consultation) {
          // Show success message
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Консультация успешно забронирована!'),
              backgroundColor: Colors.green,
            ),
          );

          // Navigate to consultation detail
          context.go('/consultations/${consultation.id}');
        },
        error: (message) {
          // Show error message
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Colors.red,
            ),
          );
        },
      );
    });

    final state = ref.watch(bookingNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Забронировать консультацию'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Lawyer info
            _buildLawyerInfo(),
            const SizedBox(height: 24),

            // Consultation type
            _buildTypeSelector(),
            const SizedBox(height: 24),

            // Time slot (for scheduled consultations)
            if (_selectedType == ConsultationType.scheduled) ...[
              _buildTimeSlotSelector(),
              const SizedBox(height: 24),
            ],

            // Description
            _buildDescriptionField(),
            const SizedBox(height: 24),

            // Important info
            _buildImportantInfo(),
            const SizedBox(height: 32),

            // Submit button
            state.maybeWhen(
              loading: () => const Center(child: CircularProgressIndicator()),
              orElse: () => PrimaryButton(
                text: 'Забронировать',
                onPressed: _onSubmit,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build lawyer info card
  Widget _buildLawyerInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              child: Text(widget.lawyerName[0].toUpperCase()),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Юрист',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.lawyerName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build consultation type selector
  Widget _buildTypeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Тип консультации',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        SegmentedButton<ConsultationType>(
          segments: const [
            ButtonSegment(
              value: ConsultationType.emergency,
              label: Text('Экстренная'),
              icon: Icon(Icons.emergency_rounded),
            ),
            ButtonSegment(
              value: ConsultationType.scheduled,
              label: Text('Запланированная'),
              icon: Icon(Icons.event_rounded),
            ),
          ],
          selected: {_selectedType},
          onSelectionChanged: (Set<ConsultationType> newSelection) {
            setState(() {
              _selectedType = newSelection.first;
              if (_selectedType == ConsultationType.emergency) {
                _selectedStartTime = null;
                _selectedEndTime = null;
              }
            });
          },
        ),
        const SizedBox(height: 8),
        Text(
          _selectedType == ConsultationType.emergency
              ? 'Юрист ответит в течение 30 минут'
              : 'Выберите удобное время для консультации',
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  /// Build time slot selector
  Widget _buildTimeSlotSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Время консультации',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.access_time),
                label: Text(
                  _selectedStartTime == null
                      ? 'Начало'
                      : _formatTime(_selectedStartTime!),
                ),
                onPressed: () => _selectStartTime(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.access_time),
                label: Text(
                  _selectedEndTime == null
                      ? 'Конец'
                      : _formatTime(_selectedEndTime!),
                ),
                onPressed: () => _selectEndTime(),
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Build description field
  Widget _buildDescriptionField() {
    return CustomTextField(
      controller: _descriptionController,
      label: 'Описание проблемы',
      hint: 'Опишите вашу ситуацию подробно...',
      maxLines: 5,
      maxLength: 2000,
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'Пожалуйста, опишите вашу проблему';
        }
        if (value.length < 10) {
          return 'Описание должно содержать минимум 10 символов';
        }
        return null;
      },
    );
  }

  /// Build important info
  Widget _buildImportantInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue.shade700),
              const SizedBox(width: 8),
              Text(
                'Важная информация',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            '• Консультация будет подтверждена юристом\n'
            '• Вы получите уведомление о подтверждении\n'
            '• Оплата списывается после завершения консультации\n'
            '• Вы можете отменить бронирование до начала',
            style: TextStyle(fontSize: 13, height: 1.5),
          ),
        ],
      ),
    );
  }

  /// Select start time
  Future<void> _selectStartTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(hours: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );

    if (date == null) return;

    if (!mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (time == null) return;

    setState(() {
      _selectedStartTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );

      // Auto-set end time to 1 hour later
      _selectedEndTime = _selectedStartTime!.add(const Duration(hours: 1));
    });
  }

  /// Select end time
  Future<void> _selectEndTime() async {
    if (_selectedStartTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Сначала выберите время начала')),
      );
      return;
    }

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _selectedStartTime!.add(const Duration(hours: 1)),
      ),
    );

    if (time == null) return;

    setState(() {
      _selectedEndTime = DateTime(
        _selectedStartTime!.year,
        _selectedStartTime!.month,
        _selectedStartTime!.day,
        time.hour,
        time.minute,
      );
    });
  }

  /// Format time for display
  String _formatTime(DateTime dateTime) {
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final day = dateTime.day.toString().padLeft(2, '0');
    final month = dateTime.month.toString().padLeft(2, '0');
    return '$day.$month в $hour:$minute';
  }

  /// Handle submit
  void _onSubmit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Validate time slot for scheduled consultations
    if (_selectedType == ConsultationType.scheduled) {
      if (_selectedStartTime == null || _selectedEndTime == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Выберите время начала и окончания консультации'),
          ),
        );
        return;
      }
    }

    // Book consultation
    ref.read(bookingNotifierProvider.notifier).bookConsultation(
          lawyerId: widget.lawyerId,
          consultationType: _selectedType.name,
          description: _descriptionController.text.trim(),
          scheduledStart: _selectedStartTime,
          scheduledEnd: _selectedEndTime,
        );
  }
}
