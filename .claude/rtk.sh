#!/bin/bash
# RTK (Rust Token Killer) initialization for TAMM project
# This script enables RTK token optimization across all AI tools and terminals
# Source this file in your shell profile to activate RTK metrics tracking

# Detect if RTK is installed
if ! command -v rtk &> /dev/null; then
    echo "⚠️  RTK (Rust Token Killer) not found. Install with: cargo install rtk"
    return 1
fi

# Shell hook for automatic token tracking (zsh/bash compatible)
# Runs rtk gain --silent after every command to track savings
_rtk_precmd() {
    # Only run if RTK is available
    if command -v rtk &> /dev/null; then
        # Fire and forget - async background execution
        (rtk gain --silent 2>/dev/null &)
    fi
}

# Zsh integration
if [[ -n "${ZSH_VERSION}" ]]; then
    if [[ ! " ${precmd_functions[@]} " =~ " _rtk_precmd " ]]; then
        precmd_functions+=(_rtk_precmd)
    fi
fi

# Bash integration (for PROMPT_COMMAND)
if [[ -n "${BASH_VERSION}" ]]; then
    if [[ ":$PROMPT_COMMAND:" != *":_rtk_precmd:"* ]]; then
        PROMPT_COMMAND="${PROMPT_COMMAND:+${PROMPT_COMMAND} ; }_rtk_precmd"
    fi
fi

# Utility functions
alias rtk-summary="rtk gain"
alias rtk-history="rtk gain --history"
alias rtk-analyze="rtk discover"
