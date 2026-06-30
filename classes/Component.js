class ComponentBuilder {
    constructor(color = 0x5576af) {
        this.type = enums.CONTAINER;
        this.defaultColor = color;
        this.accent_color = color;

        this.components = [];
        this.files = [];
    }

    reset() {
        this.accent_color = this.defaultColor;
        this.components = [];
        this.files = [];

        return this;
    }

    push(...components) {
        this.components.push(...components.filter(Boolean));
        return this;
    }

    text(content, reset = false) {
        if (reset) this.reset();

        return this.push({
            type: enums.TEXT,
            content:
                "\n" +
                (Array.isArray(content)
                    ? content.join("\n")
                    : String(content))
        });
    }

    separator(spacing = 1) {
        return this.push({
            type: enums.SEPARATOR,
            divider: true,
            spacing
        });
    }

    addFile(url) {
        this.files.push({ url });

        return this.push({
            type: enums.FILE,
            file: { url }
        });
    }

    addImage(urls) {
        urls = Array.isArray(urls) ? urls : [urls];

        return this.push({
            type: enums.MEDIA,
            items: urls.map(url => ({
                media: { url }
            }))
        });
    }

    addimage(urls) {
        return this.addImage(urls);
    }

    addThumbnail(url, ...texts) {
        return this.push({
            type: enums.SECTION,
            components: texts.map(text => ({
                type: enums.TEXT,
                content: String(text)
            })),
            accessory: {
                type: enums.THUMBNAIL,
                media: {
                    url: url ?? ""
                }
            }
        });
    }

    addthumbnail(...args) {
        return this.addThumbnail(...args);
    }

    addLinkButton(label, url) {
        return this.push({
            type: enums.ACTION_ROW,
            components: [
                {
                    type: enums.BUTTON,
                    style: 5,
                    label,
                    url
                }
            ]
        });
    }

    addButtons({
        custom_id,
        label,
        style = 1,
        emoji = null,
        text = null
    }) {
        return this.push({
            type: enums.SECTION,
            components: text
                ? [{
                    type: enums.TEXT,
                    content: text
                }]
                : [],
            accessory: {
                type: enums.BUTTON,
                custom_id,
                label,
                style,
                emoji
            }
        });
    }

    addSelectionMenu(type, custom_id, placeholder, options = []) {
        type = menuTypes[type] ?? type;

        let menu = { type, custom_id, placeholder };
        if (type === enums.USER_SELECT)
            menu.options = options;

        if (type === enums.CHANNEL_SELECT)
            menu.channel_types = [0, 2, 4, 5, 13];

        return this.push({
            type: enums.ACTION_ROW,
            components: [menu]
        });
    }

    addFileAttachment(name, description, buffer) {
        this.files.push({
            attachment: Buffer.from(buffer),
            name,
            description
        });

        return this;
    }

    toJSON() {
        return {
            type: this.type,
            accent_color: this.accent_color,
            components: this.components
        };
    }
}

module.exports = ComponentBuilder;

const enums = {
    ACTION_ROW: 1, BUTTON: 2,
    USER_SELECT: 3, MENTIONABLE_SELECT: 5,
    ROLE_SELECT: 6, CHANNEL_SELECT: 8,
    SECTION: 9, TEXT: 10,
    THUMBNAIL: 11, MEDIA: 12,
    FILE: 13, SEPARATOR: 14,
    CONTAINER: 17
};

const menuTypes = {
    user: enums.USER_SELECT,
    mentionable: enums.MENTIONABLE_SELECT,
    role: enums.ROLE_SELECT,
    channel: enums.CHANNEL_SELECT
};