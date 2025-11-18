import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../application/providers/emergency_contact_providers.dart';

/// Add/Edit emergency contact screen
class AddEmergencyContactScreen extends ConsumerStatefulWidget {
  final String? contactId;

  const AddEmergencyContactScreen({super.key, this.contactId});

  @override
  ConsumerState<AddEmergencyContactScreen> createState() =>
      _AddEmergencyContactScreenState();
}

class _AddEmergencyContactScreenState
    extends ConsumerState<AddEmergencyContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  String _selectedRelationship = 'spouse';
  bool _isLoading = false;

  final _relationships = const [
    {'value': 'spouse', 'label': 'Супруг(а)', 'icon': Icons.favorite},
    {'value': 'parent', 'label': 'Родитель', 'icon': Icons.family_restroom},
    {'value': 'child', 'label': 'Ребенок', 'icon': Icons.child_care},
    {'value': 'sibling', 'label': 'Брат/Сестра', 'icon': Icons.people},
    {'value': 'friend', 'label': 'Друг', 'icon': Icons.person},
    {'value': 'colleague', 'label': 'Коллега', 'icon': Icons.work},
    {'value': 'other', 'label': 'Другое', 'icon': Icons.person_outline},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.contactId != null;

    return Scaffold(
      backgroundColor: AppColors.grey50,
      appBar: AppBar(
        title: Text(isEdit ? 'Редактировать контакт' : 'Добавить контакт'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.grey900,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Name field
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Имя',
                hintText: 'Введите имя',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person_outline),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Введите имя';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Phone field
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Номер телефона',
                hintText: '+7 (___) ___-__-__',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Введите номер телефона';
                }
                // Basic phone validation
                final phoneRegex = RegExp(r'^\+?[0-9]{10,15}$');
                if (!phoneRegex.hasMatch(value.replaceAll(RegExp(r'[\s\-\(\)]'), ''))) {
                  return 'Введите корректный номер';
                }
                return null;
              },
            ),

            const SizedBox(height: 24),

            // Relationship selector
            const Text(
              'Отношение',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 12),

            ..._relationships.map((relationship) {
              final isSelected = _selectedRelationship == relationship['value'];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppColors.coral : AppColors.grey300,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: RadioListTile<String>(
                  title: Text(
                    relationship['label'] as String,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  secondary: Icon(
                    relationship['icon'] as IconData,
                    color: isSelected ? AppColors.coral : AppColors.grey600,
                  ),
                  value: relationship['value'] as String,
                  groupValue: _selectedRelationship,
                  onChanged: (value) {
                    setState(() => _selectedRelationship = value!);
                  },
                  activeColor: AppColors.coral,
                ),
              );
            }),

            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveContact,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.coral,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(isEdit ? 'Сохранить' : 'Добавить'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _saveContact() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref
          .read(emergencyContactOperationsProvider.notifier)
          .addContact(
            name: _nameController.text,
            phoneNumber: _phoneController.text,
            relationship: _selectedRelationship,
          );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Контакт сохранен')),
        );
        context.pop();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Не удалось сохранить контакт')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
