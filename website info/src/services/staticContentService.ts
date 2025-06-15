export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string; // HTML content from rich text editor
  lastModified: string;
  version: number;
  history: {
    version: number;
    timestamp: string;
    content: string;
  }[];
}

const mockStaticPages: StaticPage[] = [
  {
    id: 'page-about',
    slug: 'about-us',
    title: 'About Us',
    content: '<p>Welcome to Steppers Life! We are a community dedicated to connecting dancers with events, classes, and instructors worldwide.</p>',
    lastModified: '2024-01-10',
    version: 1,
    history: [{ version: 1, timestamp: '2024-01-10', content: '<p>Welcome to Steppers Life! We are a community dedicated to connecting dancers with events, classes, and instructors worldwide.</p>' }],
  },
  {
    id: 'page-tos',
    slug: 'terms-of-service',
    title: 'Terms of Service',
    content: '<p>These are our terms of service. By using our platform, you agree to these terms...</p>',
    lastModified: '2024-02-01',
    version: 1,
    history: [{ version: 1, timestamp: '2024-02-01', content: '<p>These are our terms of service. By using our platform, you agree to these terms...</p>' }],
  },
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '<p>Your privacy is important to us. This policy explains how we collect, use, and protect your data.</p>',
    lastModified: '2024-02-01',
    version: 1,
    history: [{ version: 1, timestamp: '2024-02-01', content: '<p>Your privacy is important to us. This policy explains how we collect, use, and protect your data.</p>' }],
  },
  {
    id: 'page-faq',
    slug: 'faq',
    title: 'Frequently Asked Questions',
    content: '<p><h3>General Questions</h3><p>Q: How do I create an account?<br/>A: Click on "Sign Up" and follow the instructions.</p></p>',
    lastModified: '2024-03-05',
    version: 1,
    history: [{ version: 1, timestamp: '2024-03-05', content: '<p><h3>General Questions</h3><p>Q: How do I create an account?<br/>A: Click on "Sign Up" and follow the instructions.</p></p>' }],
  },
  {
    id: 'page-contact',
    slug: 'contact-us',
    title: 'Contact Us',
    content: '<p>Have questions? Reach out to us at support@stepperslife.com or call us at (123) 456-7890.</p>',
    lastModified: '2024-01-10',
    version: 1,
    history: [{ version: 1, timestamp: '2024-01-10', content: '<p>Have questions? Reach out to us at support@stepperslife.com or call us at (123) 456-7890.</p>' }],
  },
];

class StaticContentService {
  private pages: StaticPage[] = [...mockStaticPages];

  async getPages(): Promise<StaticPage[]> {
    console.log('StaticContentService: Fetching all static pages.');
    return new Promise((resolve) => setTimeout(() => resolve(this.pages), 300));
  }

  async getPageBySlug(slug: string): Promise<StaticPage | null> {
    console.log(`StaticContentService: Fetching page by slug: ${slug}`);
    return new Promise((resolve) => setTimeout(() => resolve(this.pages.find(page => page.slug === slug) || null), 300));
  }

  async updatePage(
    id: string,
    title: string,
    slug: string,
    content: string
  ): Promise<StaticPage> {
    console.log(`StaticContentService: Updating page ${id}.`);
    const pageIndex = this.pages.findIndex(page => page.id === id);
    if (pageIndex === -1) {
      throw new Error('Page not found');
    }

    const currentPage = this.pages[pageIndex];
    const newVersion = currentPage.version + 1;
    const newHistoryEntry = {
      version: newVersion,
      timestamp: new Date().toISOString().split('T')[0],
      content: currentPage.content, // Save previous content
    };

    const updatedPage: StaticPage = {
      ...currentPage,
      title,
      slug,
      content,
      lastModified: new Date().toISOString().split('T')[0],
      version: newVersion,
      history: [...currentPage.history, newHistoryEntry], // Add previous version to history
    };

    this.pages[pageIndex] = updatedPage;
    console.log(`AUDIT: Static page '${id}' updated to version ${newVersion}.`);
    return new Promise((resolve) => setTimeout(() => resolve(updatedPage), 500));
  }

  async createPage(
    slug: string,
    title: string,
    content: string
  ): Promise<StaticPage> {
    console.log(`StaticContentService: Creating new page with slug: ${slug}.`);
    const newPage: StaticPage = {
      id: `page-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
      slug,
      title,
      content,
      lastModified: new Date().toISOString().split('T')[0],
      version: 1,
      history: [{ version: 1, timestamp: new Date().toISOString().split('T')[0], content }],
    };
    this.pages.push(newPage);
    console.log(`AUDIT: New static page '${slug}' created.`);
    return new Promise((resolve) => setTimeout(() => resolve(newPage), 500));
  }

  async deletePage(id: string): Promise<{ message: string }> {
    console.log(`StaticContentService: Deleting page ${id}.`);
    const initialLength = this.pages.length;
    this.pages = this.pages.filter(page => page.id !== id);
    if (this.pages.length === initialLength) {
      throw new Error('Page not found');
    }
    console.log(`AUDIT: Static page '${id}' deleted.`);
    return new Promise((resolve) => setTimeout(() => resolve({ message: `Page ${id} deleted.` }), 300));
  }

  async rollbackPage(id: string, version: number): Promise<StaticPage> {
    console.log(`StaticContentService: Rolling back page ${id} to version ${version}.`);
    const pageIndex = this.pages.findIndex(page => page.id === id);
    if (pageIndex === -1) {
      throw new Error('Page not found');
    }

    const currentPage = this.pages[pageIndex];
    const versionToRollbackTo = currentPage.history.find(h => h.version === version);

    if (!versionToRollbackTo) {
      throw new Error('Version not found in history');
    }

    const newCurrentVersion = currentPage.version + 1; // New version after rollback
    const newHistoryEntry = {
      version: newCurrentVersion,
      timestamp: new Date().toISOString().split('T')[0],
      content: currentPage.content, // Save current content before rollback
    };

    const rolledBackPage: StaticPage = {
      ...currentPage,
      content: versionToRollbackTo.content,
      lastModified: new Date().toISOString().split('T')[0],
      version: newCurrentVersion,
      history: [...currentPage.history, newHistoryEntry], // Add the current state to history before rolling back
    };
    
    this.pages[pageIndex] = rolledBackPage;
    console.log(`AUDIT: Static page '${id}' rolled back to version ${version}. New current version: ${newCurrentVersion}`);
    return new Promise((resolve) => setTimeout(() => resolve(rolledBackPage), 500));
  }
}

export const staticContentService = new StaticContentService(); 