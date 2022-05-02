


using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace salmpledv2_backend.Services
{
    public class SampleService : ISampleService
    {
        private readonly MyContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly IMapper _mapper;

        public SampleService(MyContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }


        public async Task<object> UpdateTempos(TempoListDTO dto) {
            try {

                List<string> mp3Names = dto.list.Select(d => d.CKey).ToList<string>();
                var samples = await 
                _context.Samples
                .TemporalAll()
                .IgnoreQueryFilters()
                .Where(s => mp3Names.Contains(s.CKey))
                .ToListAsync();

                
                foreach(var sample in samples) {
                    sample.Tempo = dto.list.Find(d => d.CKey == sample.CKey).Tempo;
                    sample.UpdatedBy = "Feature Extractor";
                    Console.WriteLine(sample.Tempo);

                }

                //await _context.SaveChangesAsync();

                samples = await 
                _context.Samples
                .IgnoreQueryFilters()
                .Where(s => mp3Names.Contains(s.CKey))
                .ToListAsync();

                
                foreach(var sample in samples) {
                    sample.Tempo = dto.list.Find(d => d.CKey == sample.CKey).Tempo;
                    sample.UpdatedBy = "Feature Extractor";
                    Console.WriteLine(sample.UpdatedBy);
                    Console.WriteLine(sample.Tempo);

                }

                await _context.SaveChangesAsync();

                return new {
                    Result = _mapper.Map<List<GetSampleDTO>>(samples),
                    Err = "",
                };

            }catch (Exception e){

                return new {
                    Result = "",
                    Err = e.Message,
                };

            }
        }
        public async Task<ServiceResponse<List<GetSampleDTO>>> RemoveSelected(GenericListDTO list)
        {
            ServiceResponse<List<GetSampleDTO>> res = new ServiceResponse<List<GetSampleDTO>>();

            try
            {

                var claimsPrincipal = _httpContextAccessor.HttpContext?.User;

                    // Get the username claim from the claims principal - if the user is not authenticated the claim will be null
                var _username = claimsPrincipal?.Claims?.SingleOrDefault(c => c.Type == "https://myapp.example.com/username")?.Value ?? "Anon";


                var s = await _context.Samples.Where(s => list.Ids.Contains(s.Id)).ToListAsync();

                _context.Samples.RemoveRange(s);
                Pack p = await _context.Packs.Where(p => p.Id == s[0].PackId).SingleAsync();
                p.UpdatedDate = DateTime.UtcNow;
                p.UpdatedBy = _username;
                await _context.SaveChangesAsync();
                res.Result = _mapper.Map<List<GetSampleDTO>>(s);

            }
            catch (Exception ex)
            {
                res.Err = ex.Message;
            }

            return res;

        }
        public async Task<ServiceResponse<GetSampleDTO>> AddSample(AddSampleDTO sample)
        {

            ServiceResponse<GetSampleDTO> res = new ServiceResponse<GetSampleDTO>();


            try
            {
                var dig = await _context.Samples.Where(s => s.Name == sample.Name && s.PackId == sample.PackId).CountAsync();
                Sample s;
                if (dig > 0)
                {

                    var un = Guid.NewGuid();
                    var apnd = un.ToString().Substring(0, 8);
                    s = new Sample
                    {
                        Id = un,
                        Name = $"{sample.Name}_{apnd}",
                        Region = sample.Region,
                        PackId = sample.PackId,
                        Bucket = sample.Bucket,
                        CKey = sample.CKey,
                        UKey = sample.UKey,
                        MimeType = sample.MimeType,
                    };
                }
                else
                {
                    s = new Sample
                    {
                        Id = Guid.NewGuid(),
                        Name = sample.Name,
                        Region = sample.Region,
                        PackId = sample.PackId,
                        Bucket = sample.Bucket,
                        CKey = sample.CKey,
                        UKey = sample.UKey,
                        MimeType = sample.MimeType,
                    };

                }


                await _context.Samples.AddAsync(s);
                Pack p = await _context.Packs.Where(p => p.Id == sample.PackId).FirstOrDefaultAsync();
                p.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                res.Result = _mapper.Map<GetSampleDTO>(s);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;

        }

        public async Task<ServiceResponse<List<GetSampleDTO>>> RenameSamples(RenameSampleListDTO list)
        {

            var res = new ServiceResponse<List<GetSampleDTO>>();
            try
            {
                
                List<RenameSampleDTO> renameList = list.list;
                List<Guid> ids = renameList.Select(r => r.Id).ToList<Guid>();

                List<Sample> samplelist = await _context.Samples
                .Where(st => ids.Contains(st.Id))
                .ToListAsync();

               
                foreach(var s in samplelist) {
                    s.Name = renameList.Find(p => p.Id == s.Id).Name;
                }

                

                var claimsPrincipal = _httpContextAccessor.HttpContext?.User;

                    // Get the username claim from the claims principal - if the user is not authenticated the claim will be null
                var _username = claimsPrincipal?.Claims?.SingleOrDefault(c => c.Type == "https://myapp.example.com/username")?.Value ?? "Anon";


                Pack p = await _context.Packs.Where(p => p.Id == list.list[0].PackId).FirstOrDefaultAsync();
                p.UpdatedDate = DateTime.UtcNow;
                p.UpdatedBy = _username;

                await _context.SaveChangesAsync();

                res.Result = _mapper.Map<List<GetSampleDTO>>(samplelist);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }
            return res;

        }

        public async Task<ServiceResponse<List<GetSampleDTO>>> AddTags(AddTagListDTO list)
        {
            ServiceResponse<List<GetSampleDTO>> res = new ServiceResponse<List<GetSampleDTO>>();
            try
            {
                List<Sample> arr = await _context.Samples.Where(s => list.SampleIds.Contains(s.Id)).ToListAsync();

                List<Guid> tagIdList = new List<Guid>();

                List<Tag> newTags = new List<Tag>();

                list.Tags.ForEach(tag =>
                {
                    if (tag.Id == null)
                    {
                        Guid newId = Guid.NewGuid();
                        newTags.Add(new Tag
                        {
                            Id = newId,
                            Name = tag.Name
                        });

                        tagIdList.Add(newId);
                    }
                    else
                    {
                        tagIdList.Add(tag.Id.GetValueOrDefault());
                    }

                });

                await _context.AddRangeAsync(newTags);
                await _context.SaveChangesAsync();

                List<Tag> arr2 = await _context.Tags.Where(t => tagIdList.Contains(t.Id)).ToListAsync();

                List<SampleTag> sampleTags = new List<SampleTag>();

                foreach (var a in arr)
                {
                    foreach (var b in arr2)
                    {
                        var exists = _context.SampleTags.Where(st => st.TagId == b.Id && st.SampleId == a.Id).Count() > 0;
                        if (!exists)
                        {
                            sampleTags.Add(new SampleTag
                            {
                                TagId = b.Id,
                                SampleId = a.Id,
                            });
                        }
                    }
                }

                await _context.SampleTags.AddRangeAsync(sampleTags);

                Pack p = await _context.Packs.Where(p => p.Id == arr[0].PackId).FirstOrDefaultAsync();

                var claimsPrincipal = _httpContextAccessor.HttpContext?.User;

                    // Get the username claim from the claims principal - if the user is not authenticated the claim will be null
                var _username = claimsPrincipal?.Claims?.SingleOrDefault(c => c.Type == "https://myapp.example.com/username")?.Value ?? "Anon";


                p.UpdatedDate = DateTime.UtcNow;

                p.UpdatedBy = _username;

                await _context.SaveChangesAsync();
                res.Result = _mapper.Map<List<GetSampleDTO>>(arr);

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }
            return res;
        }

        public async Task<ServiceResponse<List<GetSampleDTO>>> AddBulkSamples(AddSampleListDTO list) {
            ServiceResponse<List<GetSampleDTO>> res = new ServiceResponse<List<GetSampleDTO>>();


            List<AddSampleDTO> newSamples = list.samples;

            List<Sample> createList = new List<Sample>(); 
            try
            {
                

                foreach(var sample in newSamples) {
                    createList.Add (new Sample
                    {
                        Id = Guid.NewGuid(),
                        Name = sample.Name,
                        Region = sample.Region,
                        PackId = sample.PackId,
                        Bucket = sample.Bucket,
                        CKey = sample.CKey,
                        UKey = sample.UKey,
                        MimeType = sample.MimeType,
                    });
                }


                await _context.Samples.AddRangeAsync(createList);
                Pack p = await _context.Packs.Where(p => p.Id == newSamples[0].PackId).FirstOrDefaultAsync();
                var claimsPrincipal = _httpContextAccessor.HttpContext?.User;
                var _username = claimsPrincipal?.Claims?.SingleOrDefault(c => c.Type == "https://myapp.example.com/username")?.Value ?? "Anon";
                p.UpdatedDate = DateTime.UtcNow;
                p.UpdatedBy = _username;
                await _context.SaveChangesAsync();
                res.Result = _mapper.Map<List<GetSampleDTO>>(createList);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }
            return res;
        }

    }





}