#!/usr/bin/sh

# Count available upgrades before sync
available_upgrade_count_before=$(pacman -Quq | wc -l)

# Notify user that sync is starting
notify-send "⟨⟨ SYS::UPDT ⟩⟩" "◢◤ Synchronizing neural database streams..." \
    --expire-time=5000

# Sync repositories using pkexec for GUI password prompt
if pkexec pacman -Sy; then # RECOMMENDEDL you can install policykit agent like polkit-gnome or polkit-kde agent for asking password in GUI interface 
    available_upgrade_count_after=$(pacman -Quq | wc -l) # Count available upgrades after sync
    
    new_packages=$((available_upgrade_count_after - available_upgrade_count_before)) # Calculate the difference
    
    # Send appropriate notification
    if [ "$new_packages" -gt 0 ]; then
        notify-send "⟨⟨ SYS::UPDT ⟩⟩" "◢ DETECTED: $new_packages new data packets ◤\n> Total injectable modules: $available_upgrade_count_after\n\nFound $new_packages new package(s) available for upgrade.\nTotal upgradable packages: $available_upgrade_count_after"
    elif [ "$available_upgrade_count_after" -gt 0 ]; then
        notify-send "⟨⟨ SYS::UPDT ⟩⟩" "◢ Neural sync complete ◤\n> $available_upgrade_count_after module(s) pending injection [[Available for upgrade]]\n\nRepository synchronized"
    else
        notify-send "⟨⟨ SYS::UPDT ⟩⟩" "◢ System optimized. All firmware current. ◤\n\nSystem is up to date. No packages need upgrading.\n\nSystem is up to date. No packages need upgrading."
    fi
else
    notify-send "⟨⟨ ERR::CRIT ⟩⟩" "◢◤ FATAL: Database sync corrupted\n> Connection to mainframe lost\n\nFailed to synchronize package databases.\n> Either you cancelled the polkit or there is something wrong with *pacman*." \
        --icon=dialog-error \
        --urgency=critical
fi