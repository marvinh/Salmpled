using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace salmpledv2_backend.Models {
    public class Pack : BaseEntity {
        public Guid Id {get; set;}
        [MaxLength(128)]
        public string Name {get; set;}

        [MaxLength(256)]
        public string Slug {get;set;}

        [MaxLength(280)]
        public string? Description{get;set;}
        public Guid UserId {get;set;}
        public User User {get; set;}
        public List<Sample>? Samples {get; set;}
        public Guid? GroupId {get;set;}
        public Group? Group {get;set;}
        public List<PackGenre>? PackGenres {get; set;}

    }
}