namespace salmpledv2_backend.Models {
    public class PackGenre : BaseEntity {

        public Guid PackId {get;set;}
        public Pack Pack {get;set;}
        
        public Guid GenreId {get;set;}
        public Genre Genre {get;set;}
        
    }
}