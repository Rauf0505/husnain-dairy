(() => {
  if (customElements.get('announcement-ticker')) return;

  class AnnouncementTicker extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('.announcement-ticker__track');
      this.sourceGroup = this.querySelector('[data-ticker-group]');
      this.messages = this.sourceGroup?.querySelector('.announcement-ticker__messages');
      if (!this.track || !this.sourceGroup || !this.messages) return;

      if (this.dataset.designMode === 'true') {
        this.classList.add('is-editor');
        return;
      }

      this.buildTrack();
      this.resizeObserver = new ResizeObserver(() => this.fillMessageRow());
      this.resizeObserver.observe(this);
      this.classList.add('is-ready');
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
    }

    buildTrack() {
      this.track.querySelectorAll('[data-ticker-clone]').forEach((clone) => clone.remove());
      for (let index = 0; index < 3; index += 1) {
        const clone = this.sourceGroup.cloneNode(true);
        clone.removeAttribute('data-ticker-group');
        clone.setAttribute('data-ticker-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        clone.inert = true;
        this.track.append(clone);
      }
      this.fillMessageRow();
    }

    fillMessageRow() {
      if (!this.messages?.children.length || !this.clientWidth) return;

      const originals = Array.from(this.messages.children).filter(
        (item) => !item.hasAttribute('data-ticker-message-clone'),
      );
      if (!originals.length) return;

      this.messages.querySelectorAll('[data-ticker-message-clone]').forEach((clone) => clone.remove());
      this.messages.style.minWidth = '0';
      while (this.messages.scrollWidth < this.clientWidth * 1.25) {
        originals.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.removeAttribute('data-shopify-editor-block');
          clone.removeAttribute('data-block-id');
          clone.setAttribute('data-ticker-message-clone', '');
          clone.setAttribute('aria-hidden', 'true');
          clone.inert = true;
          this.messages.append(clone);
        });
      }
      this.messages.style.minWidth = `${this.clientWidth}px`;

      this.track.querySelectorAll('[data-ticker-clone] .announcement-ticker__messages').forEach((copy) => {
        copy.innerHTML = this.messages.innerHTML;
        copy.querySelectorAll('[data-shopify-editor-block], [data-block-id]').forEach((item) => {
          item.removeAttribute('data-shopify-editor-block');
          item.removeAttribute('data-block-id');
        });
        copy.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
      });
    }
  }

  customElements.define('announcement-ticker', AnnouncementTicker);
})();
