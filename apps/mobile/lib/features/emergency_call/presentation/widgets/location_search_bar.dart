import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:advocata/features/emergency_call/application/providers/location_provider.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';

/// Search bar for address input with autocomplete
class LocationSearchBar extends ConsumerStatefulWidget {
  final Function(LocationEntity location)? onLocationSelected;
  final String? initialAddress;

  const LocationSearchBar({
    super.key,
    this.onLocationSelected,
    this.initialAddress,
  });

  @override
  ConsumerState<LocationSearchBar> createState() => _LocationSearchBarState();
}

class _LocationSearchBarState extends ConsumerState<LocationSearchBar> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showSuggestions = false;
  List<LocationEntity> _suggestions = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialAddress != null) {
      _controller.text = widget.initialAddress!;
    }

    // Listen to text changes for autocomplete
    _controller.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    final query = _controller.text.trim();

    if (query.isEmpty) {
      setState(() {
        _showSuggestions = false;
        _suggestions = [];
      });
      return;
    }

    if (query.length < 3) {
      return; // Wait for at least 3 characters
    }

    // Debounce search
    Future.delayed(const Duration(milliseconds: 500), () {
      if (_controller.text.trim() == query) {
        _searchAddresses(query);
      }
    });
  }

  Future<void> _searchAddresses(String query) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final results = await ref.read(searchAddressesProvider(query).future);

      setState(() {
        _suggestions = results;
        _showSuggestions = results.isNotEmpty;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _showSuggestions = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка поиска адреса: $e')),
        );
      }
    }
  }

  void _selectLocation(LocationEntity location) {
    _controller.text = location.fullAddress;
    setState(() {
      _showSuggestions = false;
    });
    _focusNode.unfocus();

    // Update selected location
    ref.read(selectedLocationProvider.notifier).setLocation(location);

    // Notify parent
    widget.onLocationSelected?.call(location);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search input field
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            decoration: InputDecoration(
              hintText: 'Введите адрес...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _isLoading
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : _controller.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _controller.clear();
                            setState(() {
                              _showSuggestions = false;
                              _suggestions = [];
                            });
                          },
                        )
                      : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            onSubmitted: (value) {
              if (value.trim().isNotEmpty) {
                _searchAddresses(value.trim());
              }
            },
          ),
        ),

        // Suggestions dropdown
        if (_showSuggestions && _suggestions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _suggestions.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final suggestion = _suggestions[index];
                return ListTile(
                  leading: const Icon(Icons.location_on, color: Colors.grey),
                  title: Text(
                    suggestion.address ?? suggestion.shortAddress,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  subtitle: suggestion.city != null
                      ? Text(
                          '${suggestion.city}, ${suggestion.region ?? ''}',
                          style: const TextStyle(fontSize: 12),
                        )
                      : null,
                  onTap: () => _selectLocation(suggestion),
                );
              },
            ),
          ),
      ],
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }
}
