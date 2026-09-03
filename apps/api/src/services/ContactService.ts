import Contact from "../models/Contact";
import { AppError } from "../utils/error-handler";

export class ContactService {
  async getAllContacts(status?: string) {
    const query = status ? { status } : {};
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    return contacts;
  }

  async getContactById(id: string) {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return contact;
  }

  async createContact(data: any) {
    const contact = new Contact(data);
    await contact.save();
    // TODO: Send email notification
    return contact;
  }

  async updateContactStatus(id: string, status: string) {
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return contact;
  }

  async deleteContact(id: string) {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return contact;
  }
}

export default new ContactService();
