use ratatui::{
    buffer::Buffer,
    layout::Rect,
    style::{Color, Style},
    widgets::{Block, Borders, Paragraph, Widget, Wrap},
};
use unicode_width::UnicodeWidthStr;

/// Text input component with cursor and history
pub struct InputBox {
    /// Current input text
    input: String,
    /// Cursor position (byte offset)
    cursor_pos: usize,
    /// Command history
    history: Vec<String>,
    /// Current history index (-1 = current input)
    history_index: Option<usize>,
    /// Saved input when navigating history
    saved_input: String,
    /// Whether the input is focused
    focused: bool,
}

impl InputBox {
    pub fn new() -> Self {
        Self {
            input: String::new(),
            cursor_pos: 0,
            history: Vec::new(),
            history_index: None,
            saved_input: String::new(),
            focused: true,
        }
    }

    /// Get current input text
    pub fn input(&self) -> &str {
        &self.input
    }

    /// Set input text
    pub fn set_input(&mut self, text: String) {
        self.input = text;
        self.cursor_pos = self.input.len();
    }

    /// Clear input
    pub fn clear(&mut self) {
        self.input.clear();
        self.cursor_pos = 0;
        self.history_index = None;
    }

    /// Submit input and add to history
    pub fn submit(&mut self) -> String {
        let input = std::mem::take(&mut self.input);
        self.cursor_pos = 0;
        self.history_index = None;

        if !input.trim().is_empty() {
            self.history.push(input.clone());
        }

        input
    }

    /// Insert character at cursor
    pub fn insert_char(&mut self, c: char) {
        self.input.insert(self.cursor_pos, c);
        self.cursor_pos += c.len_utf8();
    }

    /// Insert newline
    pub fn insert_newline(&mut self) {
        self.insert_char('\n');
    }

    /// Delete character before cursor
    pub fn backspace(&mut self) {
        if self.cursor_pos > 0 {
            // Find the previous character boundary
            let prev_pos = self.input[..self.cursor_pos]
                .char_indices()
                .last()
                .map(|(i, _)| i)
                .unwrap_or(0);
            self.input.remove(prev_pos);
            self.cursor_pos = prev_pos;
        }
    }

    /// Delete character at cursor
    pub fn delete(&mut self) {
        if self.cursor_pos < self.input.len() {
            self.input.remove(self.cursor_pos);
        }
    }

    /// Move cursor left
    pub fn move_left(&mut self) {
        if self.cursor_pos > 0 {
            self.cursor_pos = self.input[..self.cursor_pos]
                .char_indices()
                .last()
                .map(|(i, _)| i)
                .unwrap_or(0);
        }
    }

    /// Move cursor right
    pub fn move_right(&mut self) {
        if self.cursor_pos < self.input.len() {
            self.cursor_pos = self.input[self.cursor_pos..]
                .char_indices()
                .nth(1)
                .map(|(i, _)| self.cursor_pos + i)
                .unwrap_or(self.input.len());
        }
    }

    /// Move cursor to start
    pub fn move_start(&mut self) {
        self.cursor_pos = 0;
    }

    /// Move cursor to end
    pub fn move_end(&mut self) {
        self.cursor_pos = self.input.len();
    }

    /// Navigate to previous history entry
    pub fn history_prev(&mut self) {
        if self.history.is_empty() {
            return;
        }

        match self.history_index {
            None => {
                self.saved_input = std::mem::take(&mut self.input);
                self.history_index = Some(self.history.len() - 1);
            }
            Some(0) => {
                // Already at oldest, do nothing
                return;
            }
            Some(i) => {
                self.history_index = Some(i - 1);
            }
        }

        if let Some(i) = self.history_index {
            self.input = self.history[i].clone();
            self.cursor_pos = self.input.len();
        }
    }

    /// Navigate to next history entry
    pub fn history_next(&mut self) {
        match self.history_index {
            None => {
                // Not in history mode
                return;
            }
            Some(i) if i >= self.history.len() - 1 => {
                // Return to current input
                self.history_index = None;
                self.input = std::mem::take(&mut self.saved_input);
            }
            Some(i) => {
                self.history_index = Some(i + 1);
                self.input = self.history[i + 1].clone();
            }
        }
        self.cursor_pos = self.input.len();
    }

    /// Set focus state
    pub fn set_focused(&mut self, focused: bool) {
        self.focused = focused;
    }

    /// Check if input is empty
    pub fn is_empty(&self) -> bool {
        self.input.trim().is_empty()
    }

    /// Get cursor position for rendering
    pub fn cursor_position(&self, area: Rect) -> (u16, u16) {
        // Calculate cursor position accounting for multi-line
        let text_before_cursor = &self.input[..self.cursor_pos];
        let lines: Vec<&str> = text_before_cursor.split('\n').collect();

        let y = (lines.len() - 1) as u16;
        let x = lines.last().map(|l| l.width() as u16).unwrap_or(0);

        // Account for border and prompt
        (area.x + 1 + 2 + x, area.y + 1 + y)
    }

    /// Render the input box
    pub fn render(&self, area: Rect, buf: &mut Buffer) {
        let block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(if self.focused {
                Color::Cyan
            } else {
                Color::DarkGray
            }))
            .title(" Input ");

        let inner = block.inner(area);
        block.render(area, buf);

        // Build input with prompt
        let prompt = "> ";
        let display_text = format!("{}{}", prompt, self.input);

        let paragraph = Paragraph::new(display_text)
            .style(Style::default().fg(Color::White))
            .wrap(Wrap { trim: false });

        paragraph.render(inner, buf);
    }
}

impl Default for InputBox {
    fn default() -> Self {
        Self::new()
    }
}
