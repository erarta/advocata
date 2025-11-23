import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/document_providers.dart';
import '../../domain/entities/document_template.entity.dart';

class DownloadButton extends ConsumerStatefulWidget {
  final DocumentTemplateEntity document;
  final Function(String filePath)? onDownloadComplete;

  const DownloadButton({
    Key? key,
    required this.document,
    this.onDownloadComplete,
  }) : super(key: key);

  @override
  ConsumerState<DownloadButton> createState() => _DownloadButtonState();
}

class _DownloadButtonState extends ConsumerState<DownloadButton> {
  bool _isDownloading = false;

  @override
  Widget build(BuildContext context) {
    final progress = ref.watch(downloadProgressProvider(widget.document.id));

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isDownloading ? null : _handleDownload,
        icon: _isDownloading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  value: progress > 0 ? progress : null,
                ),
              )
            : const Icon(Icons.download),
        label: Text(
          _isDownloading
              ? 'Скачивание... ${(progress * 100).toStringAsFixed(0)}%'
              : 'Скачать документ',
        ),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor:
              widget.document.isPremium ? Colors.orange : Colors.blue,
        ),
      ),
    );
  }

  Future<void> _handleDownload() async {
    // Check if premium and user has subscription
    if (widget.document.isPremium) {
      // TODO: Check subscription status
      // For now, show dialog
      final shouldContinue = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Premium документ'),
          content: const Text(
            'Этот документ доступен только с подпиской Premium. '
            'Хотите оформить подписку?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Отмена'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Оформить'),
            ),
          ],
        ),
      );

      if (shouldContinue != true) return;

      // TODO: Navigate to subscription page
      return;
    }

    setState(() {
      _isDownloading = true;
    });

    try {
      final filePath = await ref.read(
        downloadDocumentProvider(
          documentId: widget.document.id,
          fileName: widget.document.fileName,
          fileUrl: widget.document.fileUrl,
        ).future,
      );

      if (mounted) {
        widget.onDownloadComplete?.call(filePath);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка при скачивании: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
        // Reset progress
        ref
            .read(downloadProgressProvider(widget.document.id).notifier)
            .reset();
      }
    }
  }
}
