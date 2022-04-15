namespace salmpledv2_backend.Models
{
    public class SampleTag : BaseEntity
    {
        public Guid SampleId { get; set; }
        public Sample Sample {get;set;}

        public Guid TagId { get; set; }
        public Tag Tag {get;set;}
       
    }
}