#!/usr/bin/sh

# Count available upgrades before sync
available_upgrade_count_before=$(pacman -Quq | wc -l)

# Notify user that sync is starting
notify-send "System Update" "Synchronizing package databases..." --expire-time=5000

# Sync repositories using pkexec for GUI password prompt
if pkexec pacman -Sy; then # RECOMMENDEDL you can install policykit agent like polkit-gnome or polkit-kde agent for asking password in GUI interface 
    # Count available upgrades after sync
    available_upgrade_count_after=$(pacman -Quq | wc -l)
    
    # Calculate the difference
    new_packages=$((available_upgrade_count_after - available_upgrade_count_before))
    
    # Send appropriate notification
    if [ "$new_packages" -gt 0 ]; then
        notify-send "System Update" "Found $new_packages new package(s) available for upgrade.\nTotal upgradable packages: $available_upgrade_count_after"
    elif [ "$available_upgrade_count_after" -gt 0 ]; then
        notify-send "System Update" "Repository synchronized.\n$available_upgrade_count_after package(s) available for upgrade."
    else
        notify-send "System Update" "System is up to date. No packages need upgrading."
    fi
else
    notify-send "System Update Failed" "Failed to synchronize package databases." --urgency=critical
fi