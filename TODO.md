# Pending

- [ ] BUG: Ctrl+C says Interrupt but the process continues
  - When the system is generating the response ("thinking"):
    - [ ] Make the first Ctrl+C show "Press Ctrl+C again to interrupt" and then interrupt the process, save app status and quit
    - [ ] Similar with Esc key twice, but just interrupt, no quitting
  - When the system is idle and the user is typing a prompt:
    - [ ] Make Ctrl+C once clear the prompt input and shows "Ctrl-C again to quit", twice quits the app
    - [ ] Esc once shows "press Esc again to clear", then twice clears the prompt input

- [ ] Project settings
  - [ ] Choose base branch

- [ ] Follow PR status
  - [ ] If merged offer to archive workspace

- [ ] It seems like we are only seeing incoming messages when loading messages from history
- [ ] Tab area scrolling (or how to handle tabs overflowing to the right)
- [ ] Auto name branch based on initial conversation
- [ ] Support slash commands
- [ ] Make imported sessions read-only by default

## Done

- [x] BUG: typing Ctrl+J while on the sidebar adds lines to the prompt input
- [x] When we have no workspaces under a project, it shows collapsed. It has to be shown expanded.
- [x] Dialogs are not showing when there's no workspace open. I tried Alt+I to import a session. Then when you open a tab the dialog is visible. Can you help me by compiling a list of all the keys that open dialogs so we can check which ones should be valid in this initial state?
