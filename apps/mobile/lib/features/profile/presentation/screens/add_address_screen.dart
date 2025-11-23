import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../application/providers/address_providers.dart';

/// Add/Edit address screen
class AddAddressScreen extends ConsumerStatefulWidget {
  final String? addressId;

  const AddAddressScreen({super.key, this.addressId});

  @override
  ConsumerState<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends ConsumerState<AddAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _labelController = TextEditingController();
  final _addressController = TextEditingController();

  String _selectedLabelType = 'home';
  double? _latitude;
  double? _longitude;
  bool _isDefault = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _labelController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.addressId != null;

    return Scaffold(
      backgroundColor: AppColors.grey50,
      appBar: AppBar(
        title: Text(isEdit ? 'Редактировать адрес' : 'Добавить адрес'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.grey900,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Label type selector
            const Text(
              'Тип адреса',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _LabelTypeButton(
                    label: 'Дом',
                    icon: Icons.home_outlined,
                    value: 'home',
                    groupValue: _selectedLabelType,
                    onChanged: (value) {
                      setState(() => _selectedLabelType = value);
                      _labelController.text = 'Дом';
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _LabelTypeButton(
                    label: 'Работа',
                    icon: Icons.work_outline,
                    value: 'work',
                    groupValue: _selectedLabelType,
                    onChanged: (value) {
                      setState(() => _selectedLabelType = value);
                      _labelController.text = 'Работа';
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _LabelTypeButton(
                    label: 'Другое',
                    icon: Icons.location_on_outlined,
                    value: 'other',
                    groupValue: _selectedLabelType,
                    onChanged: (value) {
                      setState(() => _selectedLabelType = value);
                      _labelController.clear();
                    },
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Custom label if "Другое"
            if (_selectedLabelType == 'other') ...[
              TextFormField(
                controller: _labelController,
                decoration: const InputDecoration(
                  labelText: 'Название',
                  hintText: 'Например: Спортзал',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Введите название';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
            ],

            // Address field
            TextFormField(
              controller: _addressController,
              decoration: InputDecoration(
                labelText: 'Адрес',
                hintText: 'Введите адрес',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.map_outlined),
                  onPressed: _selectOnMap,
                ),
              ),
              maxLines: 2,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Введите адрес';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Default checkbox
            CheckboxListTile(
              title: const Text('Сделать адресом по умолчанию'),
              value: _isDefault,
              onChanged: (value) {
                setState(() => _isDefault = value ?? false);
              },
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),

            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveAddress,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(isEdit ? 'Сохранить' : 'Добавить'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectOnMap() async {
    // TODO: Integrate with Yandex Maps to select location
    // For now, use default coordinates (Moscow)
    setState(() {
      _latitude = 55.751244;
      _longitude = 37.618423;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Функция выбора на карте будет добавлена')),
      );
    }
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final label = _selectedLabelType == 'other'
          ? _labelController.text
          : _selectedLabelType;

      final success = await ref.read(addressOperationsProvider.notifier).addAddress(
            label: label,
            address: _addressController.text,
            latitude: _latitude ?? 55.751244,
            longitude: _longitude ?? 37.618423,
            isDefault: _isDefault,
          );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Адрес сохранен')),
        );
        context.pop();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Не удалось сохранить адрес')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}

class _LabelTypeButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final String value;
  final String groupValue;
  final ValueChanged<String> onChanged;

  const _LabelTypeButton({
    required this.label,
    required this.icon,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;

    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.grey300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.grey600,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? AppColors.primary : AppColors.grey700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
