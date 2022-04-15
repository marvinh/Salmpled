
namespace salmpledv2_backend.Models{ 
    public class Tag : BaseEntity {
        public Guid Id {get;set;}
        public string Name {get; set;}
        public List<SampleTag> SampleTags {get;set;}
    }
}