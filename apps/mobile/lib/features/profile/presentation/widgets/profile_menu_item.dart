import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Profile menu item
class ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? iconColor;
  final Color? titleColor;
  final VoidCallback? onTap;

  const ProfileMenuItem({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.iconColor,
    this.titleColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        icon,
        color: iconColor ?? AppColors.primary,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          color: titleColor ?? AppColors.grey900,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.grey600,
              ),
            )
          : null,
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.grey400,
      ),
      onTap: onTap,
    );
  }
}
