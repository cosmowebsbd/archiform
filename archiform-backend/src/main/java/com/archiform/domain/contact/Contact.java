package com.archiform.domain.contact;

import com.archiform.domain.firm.Firm;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "contacts")
public class Contact extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @Column(nullable = false)
    private String name;
    private String email, phone, company, street, city, state, zip, country;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Contact() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm v) { this.firm = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getCompany() { return company; }
    public void setCompany(String v) { this.company = v; }
    public String getStreet() { return street; }
    public void setStreet(String v) { this.street = v; }
    public String getCity() { return city; }
    public void setCity(String v) { this.city = v; }
    public String getState() { return state; }
    public void setState(String v) { this.state = v; }
    public String getZip() { return zip; }
    public void setZip(String v) { this.zip = v; }
    public String getCountry() { return country; }
    public void setCountry(String v) { this.country = v; }
    public String getNotes() { return notes; }
    public void setNotes(String v) { this.notes = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private String name,email,phone,company,city,country,notes;
        public Builder firm(Firm v) { firm=v; return this; }
        public Builder name(String v) { name=v; return this; }
        public Builder email(String v) { email=v; return this; }
        public Builder phone(String v) { phone=v; return this; }
        public Builder company(String v) { company=v; return this; }
        public Builder city(String v) { city=v; return this; }
        public Builder country(String v) { country=v; return this; }
        public Builder notes(String v) { notes=v; return this; }
        public Contact build() {
            Contact c = new Contact();
            c.firm=firm; c.name=name; c.email=email; c.phone=phone;
            c.company=company; c.city=city; c.country=country; c.notes=notes;
            return c;
        }
    }
}
